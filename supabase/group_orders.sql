-- =============================================================================
-- Group Orders (GO) Schema
-- =============================================================================
-- A "Group Order" is a coordinated purchase where the store organizer
-- consolidates multiple fan orders into a single shipment from Korea/Japan/USA.
-- Participants pay in two or three stages:
--   Pago 1 – Product cost (paid upfront when the GO opens)
--   Pago 2 – International EMS/DHL shipping (paid after the box is weighed)
--   Pago 3 – Domestic last-mile delivery (paid when the organizer ships locally)
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. ENUM TYPES
-- ---------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE go_status AS ENUM ('OPEN', 'CLOSED', 'SHIPPING', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE go_split_strategy AS ENUM ('per-item', 'volumetric');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE go_payment_status AS ENUM ('PENDING', 'PAID', 'NOT_APPLICABLE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ---------------------------------------------------------------------------
-- 2. group_orders — One row per GO event (managed by admin/organizer)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.group_orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Human-readable name shown to participants (e.g. "GO aespa MY WORLD - Julio 2025")
    title               TEXT NOT NULL,

    -- Admin/organizer user
    organizer_id        UUID NOT NULL REFERENCES auth.users(id),

    -- Lifecycle
    status              go_status NOT NULL DEFAULT 'OPEN',

    -- How the international shipping cost is split among participants
    split_strategy      go_split_strategy NOT NULL DEFAULT 'per-item',

    -- Estimated cost shown while the GO is open (used by GroupOrderProgress UI)
    estimated_ems_cost  NUMERIC(10, 2),

    -- Real cost entered by the organizer when they receive the invoice from DHL/FedEx/EMS
    -- NULL until the GO is closed and the organizer fills this in
    actual_ems_cost     NUMERIC(10, 2),

    -- Target number of participants that unlocks cheaper shipping (used in progress bar)
    target_participants INTEGER,

    -- Optional deadline for joining
    closes_at           TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    closed_at           TIMESTAMP WITH TIME ZONE
);

-- Keep updated_at current automatically
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DO $$ BEGIN
    CREATE TRIGGER trg_group_orders_updated_at
        BEFORE UPDATE ON public.group_orders
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ---------------------------------------------------------------------------
-- 3. group_order_participants — One row per user per GO
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.group_order_participants (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    group_order_id          UUID NOT NULL REFERENCES public.group_orders(id) ON DELETE CASCADE,
    user_id                 UUID NOT NULL REFERENCES auth.users(id),

    -- Item details used by calculateGoShipping()
    items_count             INTEGER NOT NULL DEFAULT 0 CHECK (items_count >= 0),
    total_weight            NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_weight >= 0), -- grams

    -- JSONB snapshot of what the user ordered, e.g. [{ productId, quantity, price }]
    items_snapshot          JSONB NOT NULL DEFAULT '[]'::JSONB,

    -- ── Pago 1: Product cost ──────────────────────────────────────────────
    product_cost            NUMERIC(10, 2) NOT NULL DEFAULT 0,
    payment_1_status        go_payment_status NOT NULL DEFAULT 'PENDING',
    payment_1_paid_at       TIMESTAMP WITH TIME ZONE,
    stripe_session_id       TEXT,           -- Stripe Checkout Session for Pago 1
    mp_payment_id           TEXT,           -- MercadoPago payment ID for Pago 1

    -- ── Pago 2: International EMS shipping ───────────────────────────────
    -- Populated by generateShippingInvoices() once actual_ems_cost is known
    estimated_ems_cost      NUMERIC(10, 2),  -- initial estimate (shown in UI)
    actual_ems_cost         NUMERIC(10, 2),  -- final amount owed after GO closes
    payment_2_status        go_payment_status NOT NULL DEFAULT 'PENDING',
    payment_2_paid_at       TIMESTAMP WITH TIME ZONE,
    -- Payment link generated by generateShippingInvoices()
    ems_payment_link_url    TEXT,
    ems_stripe_price_id     TEXT,            -- Stripe Price used for the Payment Link
    ems_mp_preference_id    TEXT,            -- MP Preference ID alternative

    -- ── Pago 3: Domestic last-mile delivery ──────────────────────────────
    domestic_shipping_cost  NUMERIC(10, 2),
    payment_3_status        go_payment_status NOT NULL DEFAULT 'PENDING',
    payment_3_paid_at       TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

    -- One row per user per GO
    UNIQUE (group_order_id, user_id)
);

DO $$ BEGIN
    CREATE TRIGGER trg_go_participants_updated_at
        BEFORE UPDATE ON public.group_order_participants
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Index for the common query: "give me all participants of a GO who paid Pago 1"
CREATE INDEX IF NOT EXISTS idx_gop_go_payment1
    ON public.group_order_participants (group_order_id, payment_1_status);


-- ---------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

ALTER TABLE public.group_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_order_participants ENABLE ROW LEVEL SECURITY;

-- group_orders: anyone can read open GOs; only service-role can write
DO $$ BEGIN
    CREATE POLICY "Anyone can view group orders"
        ON public.group_orders FOR SELECT
        USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Service role manages group orders"
        ON public.group_orders FOR ALL
        TO service_role
        USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- participants: users can read their own row; service-role can read/write all
DO $$ BEGIN
    CREATE POLICY "Users can view own participation"
        ON public.group_order_participants FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can join a GO"
        ON public.group_order_participants FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Service role manages participants"
        ON public.group_order_participants FOR ALL
        TO service_role
        USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ---------------------------------------------------------------------------
-- 5. HELPER VIEW (optional, useful for the admin dashboard)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.v_group_order_summary AS
SELECT
    go.id,
    go.title,
    go.status,
    go.split_strategy,
    go.estimated_ems_cost,
    go.actual_ems_cost,
    go.target_participants,
    go.closes_at,
    COUNT(p.id)                                                        AS total_participants,
    COUNT(p.id) FILTER (WHERE p.payment_1_status = 'PAID')            AS paid_product,
    COUNT(p.id) FILTER (WHERE p.payment_2_status = 'PAID')            AS paid_ems,
    COUNT(p.id) FILTER (WHERE p.payment_3_status = 'PAID')            AS paid_domestic,
    COALESCE(SUM(p.product_cost), 0)                                   AS total_product_revenue,
    COALESCE(SUM(p.actual_ems_cost), 0)                                AS total_ems_collected
FROM public.group_orders go
LEFT JOIN public.group_order_participants p ON p.group_order_id = go.id
GROUP BY go.id;
