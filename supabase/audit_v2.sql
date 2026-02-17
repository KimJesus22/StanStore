-- =============================================
-- Audit Logs Enhancement Migration
-- Adds status tracking, performance metrics, and detailed metadata
-- =============================================

-- 1. Create Enum Type for Status
-- Using ENUM ensures data integrity for status values.
DO $$ BEGIN
    CREATE TYPE public.audit_status AS ENUM ('SUCCESS', 'ERROR', 'WARNING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Alter Table to Add New Columns
-- We use IF NOT EXISTS checks (via DO block or standard syntax where supported) 
-- to make this idempotent.
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS status public.audit_status DEFAULT 'SUCCESS'::public.audit_status,
ADD COLUMN IF NOT EXISTS duration_ms INTEGER, -- Latency in milliseconds
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb; -- Extra context (e.g. stack trace)

-- 3. Create Optimized Indices for Frequent Queries

-- Index for "Recent Errors": 
-- Optimizes: SELECT * FROM audit_logs WHERE status = 'ERROR' ORDER BY created_at DESC;
CREATE INDEX IF NOT EXISTS idx_audit_logs_status_timestamp 
ON public.audit_logs (status, created_at DESC);

-- Index for "Slow Actions":
-- Optimizes: SELECT * FROM audit_logs WHERE duration_ms > 1000;
-- We use a partial index or simple B-Tree. A simple B-Tree is good for range queries.
CREATE INDEX IF NOT EXISTS idx_audit_logs_duration 
ON public.audit_logs (duration_ms);

-- Index for Metadata Searching:
-- Optimizes: SELECT * FROM audit_logs WHERE metadata @> '{"error_code": "500"}';
-- GIN index is standard for JSONB containment queries.
CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata_gin 
ON public.audit_logs USING GIN (metadata);


-- =============================================
-- Partitioning Recommendation (Commentary)
-- =============================================
/*
PARTITIONING STRATEGY:
If you expect millions of rows (e.g., > 10M rows/year), you should consider
Table Partitioning by Range (created_at).

PostgreSQL Approach:
1. Rename existing table: ALTER TABLE audit_logs RENAME TO audit_logs_old;
2. Create new partitioned table:
   CREATE TABLE audit_logs (
     id UUID DEFAULT gen_random_uuid(),
     created_at TIMESTAMP WITH TIME ZONE NOT NULL,
     ... other columns ...
     PRIMARY KEY (id, created_at) -- Partition key must be part of PK
   ) PARTITION BY RANGE (created_at);
3. Create partitions:
   CREATE TABLE audit_logs_y2024m01 PARTITION OF audit_logs
   FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
   ...
4. Migrate data from audit_logs_old to audit_logs.

WHY LIST PARTITIONING?
- Faster deletes (DROP TABLE partition vs DELETE FROM table).
- Smaller indices per partition = faster inserts/selects.
*/
