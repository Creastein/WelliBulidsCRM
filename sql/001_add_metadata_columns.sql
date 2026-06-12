-- =====================================================
-- Migration: 001_add_metadata_columns
-- Adds proper metadata columns to the leads table
-- to replace the JSON-embedded approach in `notes`.
--
-- Run once in Supabase SQL Editor.
-- Safe to re-run (uses IF NOT EXISTS).
-- =====================================================

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS email              TEXT,
  ADD COLUMN IF NOT EXISTS assigned_to        TEXT        DEFAULT 'Well',
  ADD COLUMN IF NOT EXISTS estimated_value    BIGINT,
  ADD COLUMN IF NOT EXISTS draft_status       TEXT        DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS audit_status       TEXT        DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS proposal_status    TEXT        DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS acc_status         TEXT        DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS follow_up_count    INT         DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_contacted_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at         TIMESTAMPTZ;

-- Optional: add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to    ON leads (assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_archived_at    ON leads (archived_at);
CREATE INDEX IF NOT EXISTS idx_leads_deleted_at     ON leads (deleted_at);
CREATE INDEX IF NOT EXISTS idx_leads_status         ON leads (status);
