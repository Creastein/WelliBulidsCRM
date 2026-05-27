import { VercelRequest, VercelResponse } from '@vercel/node';
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
export function verifyAgentAuth(req: VercelRequest): boolean {
  const authHeader = req.headers.authorization || '';
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

  // If GREG_AGENT_TOKEN is configured in local file but not processed yet,
  // we can also read GREG_AGENT_TOKEN which is often in env already.
  return validTokens.includes(receivedToken);
}

// Supabase client initialization
export function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials in environment.');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Delimiters
const METADATA_START = '--- AGENT_METADATA_JSON ---';
const METADATA_END = '--- END_AGENT_METADATA_JSON ---';

// Metadata serialization helper
export function serializeLead(apiData: Partial<ApiLead>, existingNotes: string = ''): {
  dbRow: any;
  metadata: Record<string, any>;
} {
  // Strip old metadata from existingNotes if present
  let cleanNotes = existingNotes;
  const startIndex = cleanNotes.indexOf(METADATA_START);
  const endIndex = cleanNotes.indexOf(METADATA_END);
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    cleanNotes = (
      cleanNotes.slice(0, startIndex) + cleanNotes.slice(endIndex + METADATA_END.length)
    ).trim();
  } else {
    cleanNotes = cleanNotes.trim();
  }

  // If user provided a new 'notes' field in API request, let's use that as base notes
  if (apiData.notes !== undefined) {
    cleanNotes = apiData.notes.trim();
  }

  // Extra metadata fields to serialize
  const metadata: Record<string, any> = {
    email: apiData.email ?? null,
    assignedTo: apiData.assignedTo ?? 'Well',
    estimatedValue: apiData.estimatedValue !== undefined ? apiData.estimatedValue : null,
    draftStatus: apiData.draftStatus ?? 'new',
    auditStatus: apiData.auditStatus ?? 'new',
    proposalStatus: apiData.proposalStatus ?? 'new',
    accStatus: apiData.accStatus ?? 'new',
    followUpCount: apiData.followUpCount ?? 0,
    lastContactedAt: apiData.lastContactedAt ?? null,
    archivedAt: apiData.archivedAt ?? null,
    deletedAt: apiData.deletedAt ?? null,
  };

  // Build notes string containing metadata JSON block
  const notesWithMetadata = `${cleanNotes}\n\n${METADATA_START}\n${JSON.stringify(metadata, null, 2)}\n${METADATA_END}`;

  // Map to DB Columns
  const dbRow: any = {
    notes: notesWithMetadata,
    crm_note: notesWithMetadata, // keep both in sync
  };

  if (apiData.name !== undefined) dbRow.name = apiData.name;
  if (apiData.businessName !== undefined) dbRow.business_name = apiData.businessName;
  if (apiData.category !== undefined) {
    dbRow.niche = apiData.category;
    dbRow.business_type = apiData.category;
  }
  if (apiData.location !== undefined) dbRow.location = apiData.location;
  if (apiData.instagram !== undefined) dbRow.instagram_url = apiData.instagram;
  if (apiData.website !== undefined) dbRow.website_url = apiData.website;
  if (apiData.whatsapp !== undefined) dbRow.phone = apiData.whatsapp;
  if (apiData.source !== undefined) dbRow.source = apiData.source;
  if (apiData.painPoint !== undefined) dbRow.digital_presence_issue = apiData.painPoint;
  if (apiData.offerFit !== undefined) dbRow.suitable_offer = apiData.offerFit;
  if (apiData.score !== undefined) dbRow.prospect_score = apiData.score;
  if (apiData.status !== undefined) dbRow.status = apiData.status;
  if (apiData.nextFollowUpDate !== undefined) dbRow.follow_up_date = apiData.nextFollowUpDate;
  dbRow.updated_at = new Date().toISOString();

  return { dbRow, metadata };
}

// Metadata deserialization helper
export function deserializeLead(dbRow: any): ApiLead {
  const notesText = dbRow.notes || dbRow.crm_note || '';
  let cleanNotes = notesText;
  let metadata: Record<string, any> = {};

  const startIndex = notesText.indexOf(METADATA_START);
  const endIndex = notesText.indexOf(METADATA_END);

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const jsonStr = notesText.slice(startIndex + METADATA_START.length, endIndex).trim();
    try {
      metadata = JSON.parse(jsonStr);
      // Clean notes representation for the API
      cleanNotes = (
        notesText.slice(0, startIndex) + notesText.slice(endIndex + METADATA_END.length)
      ).trim();
    } catch (e) {
      console.error('Error parsing metadata block for lead id', dbRow.id, e);
    }
  }

  return {
    id: dbRow.id,
    name: dbRow.name || '',
    businessName: dbRow.business_name || dbRow.name || '',
    category: dbRow.business_type || dbRow.niche || 'Uncategorized',
    location: dbRow.location || '',
    instagram: dbRow.instagram_url || '',
    website: dbRow.website_url || '',
    whatsapp: dbRow.phone || '',
    email: metadata.email || '',
    source: dbRow.source || 'manual',
    painPoint: dbRow.digital_presence_issue || '',
    offerFit: dbRow.suitable_offer || '',
    score: dbRow.prospect_score !== undefined ? dbRow.prospect_score : null,
    status: dbRow.status || 'new',
    nextFollowUpDate: dbRow.follow_up_date || null,
    lastContactedAt: metadata.lastContactedAt || null,
    notes: cleanNotes,
    estimatedValue: metadata.estimatedValue !== undefined ? metadata.estimatedValue : null,
    assignedTo: metadata.assignedTo || 'Well',
    draftStatus: metadata.draftStatus || 'new',
    auditStatus: metadata.auditStatus || 'new',
    proposalStatus: metadata.proposalStatus || 'new',
    accStatus: metadata.accStatus || 'new',
    followUpCount: metadata.followUpCount !== undefined ? metadata.followUpCount : 0,
    createdAt: dbRow.created_at || dbRow.created_at || new Date().toISOString(),
    updatedAt: dbRow.updated_at || new Date().toISOString(),
    archivedAt: metadata.archivedAt || null,
    deletedAt: metadata.deletedAt || null,
  };
}
