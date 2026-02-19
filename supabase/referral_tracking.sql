-- =============================================================================
-- Referral Tracking
-- =============================================================================
-- Adds referrer_id to orders and a trigger that awards +50 loyalty points
-- to the referrer when a referred order is placed.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. Add referrer_id column to orders
-- ---------------------------------------------------------------------------

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES auth.users(id);

-- Index for querying referrals by referrer
CREATE INDEX IF NOT EXISTS idx_orders_referrer
    ON public.orders (referrer_id)
    WHERE referrer_id IS NOT NULL;


-- ---------------------------------------------------------------------------
-- 2. Trigger: Award +50 points to the referrer on insert
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.trg_fn_referral_reward()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only fire if this order has a referrer and is paid
    IF NEW.referrer_id IS NOT NULL AND NEW.status = 'paid' THEN

        -- UPSERT into user_rewards
        INSERT INTO public.user_rewards (id, loyalty_points)
        VALUES (NEW.referrer_id, 50)
        ON CONFLICT (id) DO UPDATE SET
            loyalty_points = public.user_rewards.loyalty_points + 50,
            updated_at     = now();

    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_referral_reward ON public.orders;
CREATE TRIGGER trg_referral_reward
    AFTER INSERT ON public.orders
    FOR EACH ROW
    WHEN (NEW.referrer_id IS NOT NULL)
    EXECUTE FUNCTION public.trg_fn_referral_reward();


-- ---------------------------------------------------------------------------
-- 3. Also handle the case where an order is updated to 'paid' later
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.trg_fn_referral_reward_on_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only fire when status changes TO 'paid' and there is a referrer
    IF NEW.referrer_id IS NOT NULL
       AND NEW.status = 'paid'
       AND (OLD.status IS DISTINCT FROM 'paid') THEN

        INSERT INTO public.user_rewards (id, loyalty_points)
        VALUES (NEW.referrer_id, 50)
        ON CONFLICT (id) DO UPDATE SET
            loyalty_points = public.user_rewards.loyalty_points + 50,
            updated_at     = now();

    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_referral_reward_on_update ON public.orders;
CREATE TRIGGER trg_referral_reward_on_update
    AFTER UPDATE OF status ON public.orders
    FOR EACH ROW
    WHEN (NEW.referrer_id IS NOT NULL AND NEW.status = 'paid' AND OLD.status IS DISTINCT FROM 'paid')
    EXECUTE FUNCTION public.trg_fn_referral_reward_on_update();
