import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Define the API Lead shape
export interface ApiLead {
  id: number;
  name: string;
  businessName: string;
  category: string;
  location: string;
  instagram: string;
  website: string;
  whatsapp: string;
  email: string;
  source: string;
  painPoint: string;
  offerFit: string;
  score: number | null;
  status: string;
  nextFollowUpDate: string | null;
  lastContactedAt: string | null;
  notes: string;
  estimatedValue: number | null;
  assignedTo: string;
  draftStatus: string;
  auditStatus: string;
  proposalStatus: string;
  accStatus: string;
  followUpCount: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  deletedAt: string | null;
}

// Bearer Token Authentication
export function verifyAgentAuth(req: Request | NextRequest): boolean {
  const authHeader = req.headers.get('authorization') || '';
  const receivedToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!authHeader || !receivedToken) return false;

  const validTokens = [
    process.env.AGENT_API_TOKEN,
    process.env.ADRIAN_AGENT_TOKEN,
    process.env.GREG_AGENT_TOKEN,
    process.env.RIO_AGENT_TOKEN,
    process.env.OPENCLAW_AGENT_TOKEN,
  ]
    .map(t => t?.trim())
    .filter((t): t is string => !!t);

  return validTokens.includes(receivedToken);
}

// Supabase client initialization
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials in environment.');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// ---------------------------------------------------------------------------
// Legacy constants — used only in deserializeLead's backward-compat fallback.
// Remove after verifying all rows have been migrated via 002_migrate_metadata_from_notes.sql.
// ---------------------------------------------------------------------------
const METADATA_START = '--- AGENT_METADATA_JSON ---';
const METADATA_END = '--- END_AGENT_METADATA_JSON ---';

/**
 * Extract legacy JSON metadata embedded in the notes text.
 * Returns { cleanNotes, metadata } — used as a fallback when new DB columns are null.
 */
function extractLegacyMetadata(notesText: string): {
  cleanNotes: string;
  metadata: Record<string, unknown>;
} {
  const startIndex = notesText.indexOf(METADATA_START);
  const endIndex = notesText.indexOf(METADATA_END);

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const jsonStr = notesText.slice(startIndex + METADATA_START.length, endIndex).trim();
    try {
      const metadata = JSON.parse(jsonStr) as Record<string, unknown>;
      const cleanNotes = (
        notesText.slice(0, startIndex) + notesText.slice(endIndex + METADATA_END.length)
      ).trim();
      return { cleanNotes, metadata };
    } catch (e) {
      console.error('Legacy metadata parse error:', e);
    }
  }

  return { cleanNotes: notesText.trim(), metadata: {} };
}

/**
 * serializeLead — maps an ApiLead partial object to a Supabase DB row.
 *
 * Metadata fields (email, assignedTo, etc.) now map directly to dedicated
 * DB columns instead of being embedded in the `notes` text.
 */
export function serializeLead(
  apiData: Partial<ApiLead>,
  existingNotes: string = ''
): { dbRow: Record<string, unknown> } {
  // Determine the clean notes value (strip legacy JSON block if still present)
  let cleanNotes: string;
  if (apiData.notes !== undefined) {
    // If caller provides new notes, strip any legacy metadata block from it
    cleanNotes = extractLegacyMetadata(apiData.notes).cleanNotes;
  } else {
    // Otherwise strip legacy block from existing notes
    cleanNotes = extractLegacyMetadata(existingNotes).cleanNotes;
  }

  // Build the DB row — metadata fields go into dedicated columns now
  const dbRow: Record<string, unknown> = {
    notes: cleanNotes,
    updated_at: new Date().toISOString(),
  };

  // Core lead fields
  if (apiData.name !== undefined)         dbRow.name                    = apiData.name;
  if (apiData.businessName !== undefined) dbRow.business_name           = apiData.businessName;
  if (apiData.category !== undefined) {
    dbRow.niche         = apiData.category;
    dbRow.business_type = apiData.category;
  }
  if (apiData.location !== undefined)       dbRow.location               = apiData.location;
  if (apiData.instagram !== undefined)      dbRow.instagram_url          = apiData.instagram;
  if (apiData.website !== undefined)        dbRow.website_url            = apiData.website;
  if (apiData.whatsapp !== undefined)       dbRow.phone                  = apiData.whatsapp;
  if (apiData.source !== undefined)         dbRow.source                 = apiData.source;
  if (apiData.painPoint !== undefined)      dbRow.digital_presence_issue = apiData.painPoint;
  if (apiData.offerFit !== undefined)       dbRow.suitable_offer         = apiData.offerFit;
  if (apiData.score !== undefined)          dbRow.prospect_score         = apiData.score;
  if (apiData.status !== undefined)         dbRow.status                 = apiData.status;
  if (apiData.nextFollowUpDate !== undefined) dbRow.follow_up_date       = apiData.nextFollowUpDate;

  // Metadata fields — now stored in dedicated DB columns
  if (apiData.email !== undefined)          dbRow.email                  = apiData.email ?? null;
  if (apiData.assignedTo !== undefined)     dbRow.assigned_to            = apiData.assignedTo ?? 'Well';
  if (apiData.estimatedValue !== undefined) dbRow.estimated_value        = apiData.estimatedValue ?? null;
  if (apiData.draftStatus !== undefined)    dbRow.draft_status           = apiData.draftStatus ?? 'new';
  if (apiData.auditStatus !== undefined)    dbRow.audit_status           = apiData.auditStatus ?? 'new';
  if (apiData.proposalStatus !== undefined) dbRow.proposal_status        = apiData.proposalStatus ?? 'new';
  if (apiData.accStatus !== undefined)      dbRow.acc_status             = apiData.accStatus ?? 'new';
  if (apiData.followUpCount !== undefined)  dbRow.follow_up_count        = apiData.followUpCount ?? 0;
  if (apiData.lastContactedAt !== undefined) dbRow.last_contacted_at     = apiData.lastContactedAt ?? null;
  if (apiData.archivedAt !== undefined)     dbRow.archived_at            = apiData.archivedAt ?? null;
  if (apiData.deletedAt !== undefined)      dbRow.deleted_at             = apiData.deletedAt ?? null;

  return { dbRow };
}

/**
 * deserializeLead — maps a Supabase DB row to an ApiLead object.
 *
 * Primary source: dedicated DB columns.
 * Fallback: legacy JSON embedded in `notes` (for rows not yet migrated via SQL script).
 * The fallback can be removed once 002_migrate_metadata_from_notes.sql has been run
 * and all data is verified.
 */
export function deserializeLead(dbRow: Record<string, unknown>): ApiLead {
  const notesText = String(dbRow.notes || dbRow.crm_note || '');

  // Backward-compat: extract legacy JSON block if new columns are not populated yet
  const { cleanNotes, metadata: legacyMeta } = extractLegacyMetadata(notesText);

  // Helper: prefer DB column value, fall back to legacy JSON field
  function col<T>(dbValue: unknown, legacyValue: unknown, defaultValue: T): T {
    if (dbValue !== null && dbValue !== undefined) return dbValue as T;
    if (legacyValue !== null && legacyValue !== undefined) return legacyValue as T;
    return defaultValue;
  }

  return {
    id:               dbRow.id as number,
    name:             String(dbRow.name || ''),
    businessName:     String(dbRow.business_name || dbRow.name || ''),
    category:         String(dbRow.business_type || dbRow.niche || 'Uncategorized'),
    location:         String(dbRow.location || ''),
    instagram:        String(dbRow.instagram_url || ''),
    website:          String(dbRow.website_url || ''),
    whatsapp:         String(dbRow.phone || ''),
    source:           String(dbRow.source || 'manual'),
    painPoint:        String(dbRow.digital_presence_issue || ''),
    offerFit:         String(dbRow.suitable_offer || ''),
    score:            dbRow.prospect_score !== undefined && dbRow.prospect_score !== null
                        ? Number(dbRow.prospect_score)
                        : null,
    status:           String(dbRow.status || 'new'),
    nextFollowUpDate: (dbRow.follow_up_date as string | null) ?? null,
    notes:            cleanNotes,
    createdAt:        String(dbRow.created_at || new Date().toISOString()),
    updatedAt:        String(dbRow.updated_at || new Date().toISOString()),

    // Metadata — read from dedicated columns, fallback to legacy JSON
    email:          String(col(dbRow.email,          legacyMeta.email,          '')),
    assignedTo:     String(col(dbRow.assigned_to,    legacyMeta.assignedTo,    'Well')),
    estimatedValue: col(dbRow.estimated_value,        legacyMeta.estimatedValue, null) as number | null,
    draftStatus:    String(col(dbRow.draft_status,   legacyMeta.draftStatus,   'new')),
    auditStatus:    String(col(dbRow.audit_status,   legacyMeta.auditStatus,   'new')),
    proposalStatus: String(col(dbRow.proposal_status, legacyMeta.proposalStatus, 'new')),
    accStatus:      String(col(dbRow.acc_status,     legacyMeta.accStatus,     'new')),
    followUpCount:  Number(col(dbRow.follow_up_count, legacyMeta.followUpCount, 0)),
    lastContactedAt: (col(dbRow.last_contacted_at,   legacyMeta.lastContactedAt, null) as string | null),
    archivedAt:     (col(dbRow.archived_at,          legacyMeta.archivedAt,    null) as string | null),
    deletedAt:      (col(dbRow.deleted_at,           legacyMeta.deletedAt,     null) as string | null),
  };
}
