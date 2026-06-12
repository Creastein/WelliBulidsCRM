import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  verifyAgentAuth,
  getSupabaseClient,
  serializeLead,
  deserializeLead,
  ApiLead,
} from '@/lib/agentHelpers';

// Zod schema for lead creation
const createLeadSchema = z.object({
  name: z.string().optional(),
  businessName: z.string().min(1, 'businessName is required'),
  category: z.string().optional().default('Uncategorized'),
  location: z.string().optional().default(''),
  address: z.string().optional().nullable(),
  googleMapsUrl: z.string().url('Valid googleMapsUrl is required').optional().nullable(),
  instagram: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email('Valid email is required').optional().nullable(),
  source: z.string().optional().default('agent'),
  painPoint: z.string().optional().default(''),
  offerFit: z.string().optional().default(''),
  score: z.number().min(1).max(10).optional().nullable(),
  status: z.string().optional().default('new'),
  nextFollowUpDate: z.string().optional().nullable(),
  lastContactedAt: z.string().optional().nullable(),
  notes: z.string().optional().default(''),
  estimatedValue: z.number().optional().nullable(),
  assignedTo: z.string().optional().default('Well'),
  draftStatus: z.string().optional().default('new'),
  auditStatus: z.string().optional().default('new'),
  proposalStatus: z.string().optional().default('new'),
  accStatus: z.string().optional().default('new'),
  followUpCount: z.number().optional().default(0),
});

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate Request
    if (!verifyAgentAuth(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const category = searchParams.get('category');
    const q = searchParams.get('q');

    // Query database
    const { data: dbLeads, error } = await supabase
      .from('leads')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, message: 'Database error', error: error.message }, { status: 500 });
    }

    // Deserialize all leads
    let apiLeads: ApiLead[] = (dbLeads || []).map(deserializeLead);

    // Filter by archived status by default, unless query parameter asks for archived
    if (status !== 'archived') {
      apiLeads = apiLeads.filter(
        lead =>
          lead.status !== 'archived' &&
          lead.status !== 'Ditolak' &&
          !lead.archivedAt &&
          !lead.deletedAt
      );
    } else {
      // If status filter is explicitly "archived"
      apiLeads = apiLeads.filter(
        lead =>
          lead.status === 'archived' ||
          lead.status === 'Ditolak' ||
          !!lead.archivedAt ||
          !!lead.deletedAt
      );
    }

    // Apply other filters in memory to support serialized metadata filtering robustly
    if (status && status !== 'archived') {
      apiLeads = apiLeads.filter(
        lead => lead.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (assignedTo) {
      apiLeads = apiLeads.filter(
        lead => lead.assignedTo.toLowerCase() === assignedTo.toLowerCase()
      );
    }

    if (category) {
      apiLeads = apiLeads.filter(
        lead => lead.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (q) {
      const queryStr = q.toLowerCase();
      apiLeads = apiLeads.filter(
        lead =>
          lead.name.toLowerCase().includes(queryStr) ||
          lead.businessName.toLowerCase().includes(queryStr) ||
          lead.location.toLowerCase().includes(queryStr) ||
          lead.whatsapp.toLowerCase().includes(queryStr) ||
          lead.notes.toLowerCase().includes(queryStr)
      );
    }

    return NextResponse.json({
      success: true,
      count: apiLeads.length,
      data: apiLeads,
    }, { status: 200 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Request
    if (!verifyAgentAuth(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const bodyJson = await req.json();

    const parsedBody = createLeadSchema.safeParse(bodyJson);
    if (!parsedBody.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: parsedBody.error.format(),
      }, { status: 400 });
    }

    const body = parsedBody.data;
    const businessNameNormalized = body.businessName.trim();
    const name = body.name || businessNameNormalized;

    // Prepare fields to check duplicate
    const googleMapsUrl = body.googleMapsUrl?.trim();
    const address = body.address?.trim();

    // 1. Check strong duplicate by Google Maps URL (DB-level — fast, no full scan needed)
    if (googleMapsUrl) {
      const { data: gmapsDup } = await supabase
        .from('leads')
        .select('id')
        .eq('google_maps_url', googleMapsUrl)
        .limit(1)
        .maybeSingle();

      if (gmapsDup) {
        return NextResponse.json({
          success: true,
          duplicate: true,
          duplicateType: 'strong_gmaps',
          message: 'Prospect already exists (matched by Google Maps URL)',
          prospectId: gmapsDup.id,
        }, { status: 200 });
      }
    }

    // Fetch all active records — needed for name/address duplicate check and soft duplicate
    const { data: allLeads, error: fetchError } = await supabase
      .from('leads')
      .select('id, name, business_name, address')
      .is('deleted_at', null);

    if (fetchError) {
      return NextResponse.json({ success: false, message: 'Database query error', error: fetchError.message }, { status: 500 });
    }

    // 2. Check strong duplicate by Name + Address
    if (address) {
      const dupNameAddress = (allLeads || []).find(
        db =>
          (db.business_name || db.name || '').toLowerCase() === businessNameNormalized.toLowerCase() &&
          db.address === address
      );
      if (dupNameAddress) {
        return NextResponse.json({
          success: true,
          duplicate: true,
          duplicateType: 'strong_name_address',
          message: 'Prospect already exists (matched by Name and Address)',
          prospectId: dupNameAddress.id,
        }, { status: 200 });
      }
    }

    // 3. Check soft duplicate by similar name (warning only)
    let warningMessage: string | undefined = undefined;
    const normalizedNewName = businessNameNormalized.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (normalizedNewName.length >= 4) {
      const similarLead = (allLeads || []).find(db => {
        const normExisting = (db.business_name || db.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return normExisting.includes(normalizedNewName) || normalizedNewName.includes(normExisting);
      });

      if (similarLead) {
        warningMessage = `Warning: A prospect with a highly similar name already exists (ID: ${similarLead.id}, Name: ${similarLead.business_name || similarLead.name}). Created anyway.`;
      }
    }

    // Map ApiLead request to DB row via serializeLead (handles all field mapping)
    const { dbRow } = serializeLead({
      name,
      businessName: businessNameNormalized,
      category: body.category,
      location: body.location,
      instagram: body.instagram || '',
      website: body.website || '',
      whatsapp: body.whatsapp || '',
      email: body.email || '',
      source: body.source,
      painPoint: body.painPoint,
      offerFit: body.offerFit,
      score: body.score,
      status: body.status,
      nextFollowUpDate: body.nextFollowUpDate,
      lastContactedAt: body.lastContactedAt,
      notes: body.notes,
      estimatedValue: body.estimatedValue,
      assignedTo: body.assignedTo,
      draftStatus: body.draftStatus,
      auditStatus: body.auditStatus,
      proposalStatus: body.proposalStatus,
      accStatus: body.accStatus,
      followUpCount: body.followUpCount,
    }, body.notes);

    // Extra columns not part of ApiLead shape
    dbRow.address         = address || null;
    dbRow.google_maps_url = googleMapsUrl || null;
    dbRow.rating          = null;
    dbRow.review_count    = null;
    dbRow.website_status  = null;
    dbRow.created_by      = (body.assignedTo || 'agent').toLowerCase();
    dbRow.priority        = 'Medium';
    dbRow.created_at      = new Date().toISOString();

    // Insert new lead
    const { data: insertedData, error: insertError } = await supabase
      .from('leads')
      .insert([dbRow])
      .select('*')
      .single();

    if (insertError) {
      return NextResponse.json({
        success: false,
        message: 'Failed to save lead',
        error: insertError.message,
      }, { status: 500 });
    }

    const createdLead = deserializeLead(insertedData);

    return NextResponse.json({
      success: true,
      duplicate: false,
      message: 'Lead created successfully',
      warning: warningMessage,
      data: createdLead,
    }, { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
