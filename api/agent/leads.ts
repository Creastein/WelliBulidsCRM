import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import {
  verifyAgentAuth,
  getSupabaseClient,
  serializeLead,
  deserializeLead,
  ApiLead,
} from '../_utils/agentHelpers';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1. Authenticate Request
    if (!verifyAgentAuth(req)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const supabase = getSupabaseClient();

    // ==========================================
    // GET: List Leads
    // ==========================================
    if (req.method === 'GET') {
      const { status, assignedTo, category, q } = req.query;

      // Query database
      const { data: dbLeads, error } = await supabase
        .from('leads')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        return res.status(500).json({ success: false, message: 'Database error', error: error.message });
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
          lead => lead.status.toLowerCase() === (status as string).toLowerCase()
        );
      }

      if (assignedTo) {
        apiLeads = apiLeads.filter(
          lead => lead.assignedTo.toLowerCase() === (assignedTo as string).toLowerCase()
        );
      }

      if (category) {
        apiLeads = apiLeads.filter(
          lead => lead.category.toLowerCase() === (category as string).toLowerCase()
        );
      }

      if (q) {
        const queryStr = (q as string).toLowerCase();
        apiLeads = apiLeads.filter(
          lead =>
            lead.name.toLowerCase().includes(queryStr) ||
            lead.businessName.toLowerCase().includes(queryStr) ||
            lead.location.toLowerCase().includes(queryStr) ||
            lead.whatsapp.toLowerCase().includes(queryStr) ||
            lead.notes.toLowerCase().includes(queryStr)
        );
      }

      return res.status(200).json({
        success: true,
        count: apiLeads.length,
        data: apiLeads,
      });
    }

    // ==========================================
    // POST: Create Lead
    // ==========================================
    if (req.method === 'POST') {
      const parsedBody = createLeadSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: parsedBody.error.format(),
        });
      }

      const body = parsedBody.data;
      const businessNameNormalized = body.businessName.trim();
      const name = body.name || businessNameNormalized;

      // Prepare fields to check duplicate
      const googleMapsUrl = body.googleMapsUrl?.trim();
      const address = body.address?.trim();

      // Fetch all active records to perform duplicate detection
      const { data: allLeads, error: fetchError } = await supabase
        .from('leads')
        .select('*');

      if (fetchError) {
        return res.status(500).json({ success: false, message: 'Database query error', error: fetchError.message });
      }

      const existingLeads = (allLeads || []).map(deserializeLead);

      // 1. Check strong duplicate by Google Maps URL
      if (googleMapsUrl) {
        const dupGmaps = existingLeads.find(
          l => l.notes.includes(googleMapsUrl) || (allLeads?.find(db => db.google_maps_url === googleMapsUrl))
        );
        if (dupGmaps) {
          return res.status(200).json({
            success: true,
            duplicate: true,
            duplicateType: 'strong_gmaps',
            message: 'Prospect already exists (matched by Google Maps URL)',
            prospectId: dupGmaps.id,
          });
        }
      }

      // 2. Check strong duplicate by Name + Address
      if (address) {
        const dupNameAddress = existingLeads.find(
          l =>
            l.businessName.toLowerCase() === businessNameNormalized.toLowerCase() &&
            allLeads?.find(db => db.id === l.id && db.address === address)
        );
        if (dupNameAddress) {
          return res.status(200).json({
            success: true,
            duplicate: true,
            duplicateType: 'strong_name_address',
            message: 'Prospect already exists (matched by Name and Address)',
            prospectId: dupNameAddress.id,
          });
        }
      }

      // 3. Check soft duplicate by similar name (warning only)
      let warningMessage: string | undefined = undefined;
      const normalizedNewName = businessNameNormalized.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      if (normalizedNewName.length >= 4) {
        const similarLead = existingLeads.find(l => {
          const normExisting = l.businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
          return normExisting.includes(normalizedNewName) || normalizedNewName.includes(normExisting);
        });

        if (similarLead) {
          warningMessage = `Warning: A prospect with a highly similar name already exists (ID: ${similarLead.id}, Name: ${similarLead.businessName}). Created anyway.`;
        }
      }

      // Map ApiLead request object to Supabase row & serialize extra metadata
      const mappedLead: Partial<ApiLead> = {
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
      };

      const { dbRow } = serializeLead(mappedLead, body.notes);

      // Inject other DB columns that are directly supported in supabase table schema
      dbRow.address = address || null;
      dbRow.google_maps_url = googleMapsUrl || null;
      dbRow.website_url = body.website || null;
      dbRow.instagram_url = body.instagram || null;
      dbRow.phone = body.whatsapp || null;
      dbRow.rating = null;
      dbRow.review_count = null;
      dbRow.website_status = null;
      dbRow.digital_presence_issue = body.painPoint || null;
      dbRow.suitable_offer = body.offerFit || null;
      dbRow.prospect_score = body.score || null;
      dbRow.source = body.source || 'agent';
      dbRow.created_by = body.assignedTo.toLowerCase() || 'agent';
      dbRow.priority = 'Medium';
      dbRow.created_at = new Date().toISOString();

      // Insert new lead
      const { data: insertedData, error: insertError } = await supabase
        .from('leads')
        .insert([dbRow])
        .select('*')
        .single();

      if (insertError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to save lead',
          error: insertError.message,
        });
      }

      const createdLead = deserializeLead(insertedData);

      return res.status(201).json({
        success: true,
        duplicate: false,
        message: 'Lead created successfully',
        warning: warningMessage,
        data: createdLead,
      });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}
