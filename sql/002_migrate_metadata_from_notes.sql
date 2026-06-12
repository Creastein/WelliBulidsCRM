-- =====================================================
-- Migration: 002_migrate_metadata_from_notes
-- One-time data migration: extracts JSON metadata
-- embedded in the `notes` column into the new
-- dedicated columns added by 001_add_metadata_columns.
--
-- Run AFTER 001_add_metadata_columns.sql.
-- Safe to re-run (COALESCE preserves existing values).
-- Only affects rows that contain the AGENT_METADATA_JSON block.
-- =====================================================

UPDATE leads
SET
  -- email: extract string value
  email = CASE
    WHEN email IS NULL AND notes LIKE '%"email": "%'
    THEN trim(both '"' from (regexp_match(notes, '"email"\s*:\s*"([^"]*)"'))[1])
    ELSE email
  END,

  -- assigned_to: extract string value
  assigned_to = CASE
    WHEN assigned_to IS NULL OR assigned_to = 'Well'
    THEN COALESCE(
      trim(both '"' from (regexp_match(notes, '"assignedTo"\s*:\s*"([^"]*)"'))[1]),
      assigned_to
    )
    ELSE assigned_to
  END,

  -- estimated_value: extract numeric value
  estimated_value = CASE
    WHEN estimated_value IS NULL AND notes LIKE '%"estimatedValue":%'
    THEN NULLIF((regexp_match(notes, '"estimatedValue"\s*:\s*(\d+)'))[1], '')::BIGINT
    ELSE estimated_value
  END,

  -- draft_status: extract string value
  draft_status = CASE
    WHEN draft_status IS NULL OR draft_status = 'new'
    THEN COALESCE(
      trim(both '"' from (regexp_match(notes, '"draftStatus"\s*:\s*"([^"]*)"'))[1]),
      draft_status
    )
    ELSE draft_status
  END,

  -- audit_status: extract string value
  audit_status = CASE
    WHEN audit_status IS NULL OR audit_status = 'new'
    THEN COALESCE(
      trim(both '"' from (regexp_match(notes, '"auditStatus"\s*:\s*"([^"]*)"'))[1]),
      audit_status
    )
    ELSE audit_status
  END,

  -- proposal_status: extract string value
  proposal_status = CASE
    WHEN proposal_status IS NULL OR proposal_status = 'new'
    THEN COALESCE(
      trim(both '"' from (regexp_match(notes, '"proposalStatus"\s*:\s*"([^"]*)"'))[1]),
      proposal_status
    )
    ELSE proposal_status
  END,

  -- acc_status: extract string value
  acc_status = CASE
    WHEN acc_status IS NULL OR acc_status = 'new'
    THEN COALESCE(
      trim(both '"' from (regexp_match(notes, '"accStatus"\s*:\s*"([^"]*)"'))[1]),
      acc_status
    )
    ELSE acc_status
  END,

  -- follow_up_count: extract integer value
  follow_up_count = CASE
    WHEN follow_up_count = 0 AND notes LIKE '%"followUpCount":%'
    THEN COALESCE((regexp_match(notes, '"followUpCount"\s*:\s*(\d+)'))[1]::INT, 0)
    ELSE follow_up_count
  END,

  -- last_contacted_at: extract timestamp (null if "null")
  last_contacted_at = CASE
    WHEN last_contacted_at IS NULL AND notes LIKE '%"lastContactedAt":%'
      AND notes NOT LIKE '%"lastContactedAt": null%'
      AND notes NOT LIKE '%"lastContactedAt":null%'
    THEN NULLIF(
      trim(both '"' from (regexp_match(notes, '"lastContactedAt"\s*:\s*"([^"]*)"'))[1]),
      ''
    )::TIMESTAMPTZ
    ELSE last_contacted_at
  END,

  -- archived_at: extract timestamp (null if "null")
  archived_at = CASE
    WHEN archived_at IS NULL AND notes LIKE '%"archivedAt":%'
      AND notes NOT LIKE '%"archivedAt": null%'
      AND notes NOT LIKE '%"archivedAt":null%'
    THEN NULLIF(
      trim(both '"' from (regexp_match(notes, '"archivedAt"\s*:\s*"([^"]*)"'))[1]),
      ''
    )::TIMESTAMPTZ
    ELSE archived_at
  END,

  -- deleted_at: extract timestamp (null if "null")
  deleted_at = CASE
    WHEN deleted_at IS NULL AND notes LIKE '%"deletedAt":%'
      AND notes NOT LIKE '%"deletedAt": null%'
      AND notes NOT LIKE '%"deletedAt":null%'
    THEN NULLIF(
      trim(both '"' from (regexp_match(notes, '"deletedAt"\s*:\s*"([^"]*)"'))[1]),
      ''
    )::TIMESTAMPTZ
    ELSE deleted_at
  END

WHERE notes LIKE '%--- AGENT_METADATA_JSON ---%';

-- =====================================================
-- STEP 3 (Run separately, AFTER verifying data above):
-- Clean up the old JSON block from the notes column.
-- Uncomment and run once you've verified all data
-- is correctly populated in the new columns.
-- =====================================================
--
-- UPDATE leads
-- SET
--   notes = trim(
--     regexp_replace(
--       notes,
--       '\n*--- AGENT_METADATA_JSON ---.*--- END_AGENT_METADATA_JSON ---',
--       '',
--       'gs'
--     )
--   ),
--   crm_note = trim(
--     regexp_replace(
--       crm_note,
--       '\n*--- AGENT_METADATA_JSON ---.*--- END_AGENT_METADATA_JSON ---',
--       '',
--       'gs'
--     )
--   )
-- WHERE notes LIKE '%--- AGENT_METADATA_JSON ---%';
