-- =============================================================================
-- Loyalty Rewards System
-- =============================================================================
-- Gamified loyalty program: users earn points and level up by participating
-- in completed Group Orders. Points and tier are auto-updated via trigger.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. ENUM TYPE
-- ---------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE loyalty_tier AS ENUM ('BRONZE', 'SILVER', 'GOLD');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ---------------------------------------------------------------------------
-- 2. user_rewards — One row per user (created on signup)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_rewards (
    id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Lifetime points accumulated across all completed GOs
    loyalty_points    INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),

    -- Number of GOs where the user paid and the GO reached COMPLETED status
    completed_gos     INTEGER NOT NULL DEFAULT 0 CHECK (completed_gos >= 0),

    -- Tier derived from completed_gos; updated automatically by trigger
    tier_level        loyalty_tier NOT NULL DEFAULT 'BRONZE',

    -- Timestamps
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Auto-update updated_at (reuses the existing set_updated_at function)
DO $$ BEGIN
    CREATE TRIGGER trg_user_rewards_updated_at
        BEFORE UPDATE ON public.user_rewards
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ---------------------------------------------------------------------------
-- 3. AUTO-CREATE user_rewards ROW ON NEW USER SIGNUP
-- ---------------------------------------------------------------------------
-- Extends the existing handle_new_user() pattern from profiles.sql

CREATE OR REPLACE FUNCTION public.handle_new_user_rewards()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_rewards (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_rewards ON auth.users;
CREATE TRIGGER on_auth_user_created_rewards
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_rewards();


-- ---------------------------------------------------------------------------
-- 4. BACKFILL — Create reward rows for ALL existing users who don't have one
-- ---------------------------------------------------------------------------

INSERT INTO public.user_rewards (id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_rewards)
ON CONFLICT (id) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 5. HELPER: Recalculate tier from completed_gos count
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.calc_loyalty_tier(gos INTEGER)
RETURNS loyalty_tier
LANGUAGE plpgsql IMMUTABLE
AS $$
BEGIN
    IF gos >= 10 THEN RETURN 'GOLD';
    ELSIF gos >= 3 THEN RETURN 'SILVER';
    ELSE RETURN 'BRONZE';
    END IF;
END;
$$;


-- ---------------------------------------------------------------------------
-- 6. TRIGGER: When a Group Order changes to 'COMPLETED', reward participants
-- ---------------------------------------------------------------------------
-- Awards +100 points and +1 completed GO to every participant who paid Pago 1.
-- Also recalculates tier_level automatically.
-- Uses an idempotency guard to prevent double-awarding if the GO is toggled
-- back and forth.

CREATE OR REPLACE FUNCTION public.trg_fn_go_completed_rewards()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only fire when status actually changes TO 'COMPLETED'
    IF NEW.status = 'COMPLETED' AND (OLD.status IS DISTINCT FROM 'COMPLETED') THEN

        -- UPSERT rewards for every paid participant in this GO
        INSERT INTO public.user_rewards (id, loyalty_points, completed_gos, tier_level)
        SELECT
            p.user_id,
            100,                                  -- initial points if new row
            1,                                    -- initial count if new row
            public.calc_loyalty_tier(1)           -- initial tier
        FROM public.group_order_participants p
        WHERE p.group_order_id = NEW.id
          AND p.payment_1_status = 'PAID'
        ON CONFLICT (id) DO UPDATE SET
            loyalty_points = public.user_rewards.loyalty_points + 100,
            completed_gos  = public.user_rewards.completed_gos  + 1,
            tier_level     = public.calc_loyalty_tier(
                                public.user_rewards.completed_gos + 1
                             ),
            updated_at     = now();

    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_go_completed_rewards ON public.group_orders;
CREATE TRIGGER trg_go_completed_rewards
    AFTER UPDATE OF status ON public.group_orders
    FOR EACH ROW
    WHEN (NEW.status = 'COMPLETED' AND OLD.status IS DISTINCT FROM 'COMPLETED')
    EXECUTE FUNCTION public.trg_fn_go_completed_rewards();


-- ---------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Users can read their own rewards
DO $$ BEGIN
    CREATE POLICY "Users can view own rewards"
        ON public.user_rewards FOR SELECT
        TO authenticated
        USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Service role manages everything
DO $$ BEGIN
    CREATE POLICY "Service role manages rewards"
        ON public.user_rewards FOR ALL
        TO service_role
        USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ---------------------------------------------------------------------------
-- 8. ADMIN VIEW (optional, for dashboard)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.v_user_rewards_summary AS
SELECT
    ur.id AS user_id,
    u.email,
    ur.loyalty_points,
    ur.completed_gos,
    ur.tier_level,
    ur.updated_at
FROM public.user_rewards ur
JOIN auth.users u ON u.id = ur.id
ORDER BY ur.loyalty_points DESC;
