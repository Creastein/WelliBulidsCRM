import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import {
  verifyAgentAuth,
  getSupabaseClient,
  serializeLead,
  deserializeLead,
  ApiLead,
} from '../../_utils/agentHelpers';

// Zod schema for lead update (all fields optional)
const updateLeadSchema = z.object({
  name: z.string().optional(),
  businessName: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional().nullable(),
  googleMapsUrl: z.string().url('Valid googleMapsUrl is required').optional().nullable(),
  instagram: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email('Valid email is required').optional().nullable(),
  source: z.string().optional(),
  painPoint: z.string().optional(),
  offerFit: z.string().optional(),
  score: z.number().min(1).max(10).optional().nullable(),
  status: z.string().optional(),
  nextFollowUpDate: z.string().optional().nullable(),
  lastContactedAt: z.string().optional().nullable(),
  notes: z.string().optional(),
  estimatedValue: z.number().optional().nullable(),
  assignedTo: z.string().optional(),
  draftStatus: z.string().optional(),
  auditStatus: z.string().optional(),
  proposalStatus: z.string().optional(),
  accStatus: z.string().optional(),
  followUpCount: z.number().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1. Authenticate Request
    if (!verifyAgentAuth(req)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.query;
    const leadId = parseInt(id as string, 10);

    if (isNaN(leadId)) {
      return res.status(400).json({ success: false, message: 'Invalid lead ID format' });
    }

    const supabase = getSupabaseClient();

    // Fetch existing lead
    const { data: dbLead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (fetchError || !dbLead) {
      return res.status(404).json({ success: false, message: `Lead with ID ${leadId} not found` });
    }

    const currentLead = deserializeLead(dbLead);

    // ==========================================
    // GET: Retrieve Specific Lead
    // ==========================================
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        data: currentLead,
      });
    }

    // ==========================================
    // PATCH: Update Partial Lead
    // ==========================================
    if (req.method === 'PATCH') {
      const parsedBody = updateLeadSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: parsedBody.error.format(),
        });
      }

      const body = parsedBody.data;

      // Merge new fields into our parsed ApiLead shape
      const mergedLead: ApiLead = {
        ...currentLead,
        name: body.name !== undefined ? body.name : currentLead.name,
        businessName: body.businessName !== undefined ? body.businessName : currentLead.businessName,
        category: body.category !== undefined ? body.category : currentLead.category,
        location: body.location !== undefined ? body.location : currentLead.location,
        instagram: body.instagram !== undefined ? (body.instagram || '') : currentLead.instagram,
        website: body.website !== undefined ? (body.website || '') : currentLead.website,
        whatsapp: body.whatsapp !== undefined ? (body.whatsapp || '') : currentLead.whatsapp,
        email: body.email !== undefined ? (body.email || '') : currentLead.email,
        source: body.source !== undefined ? body.source : currentLead.source,
        painPoint: body.painPoint !== undefined ? body.painPoint : currentLead.painPoint,
        offerFit: body.offerFit !== undefined ? body.offerFit : currentLead.offerFit,
        score: body.score !== undefined ? body.score : currentLead.score,
        status: body.status !== undefined ? body.status : currentLead.status,
        nextFollowUpDate: body.nextFollowUpDate !== undefined ? body.nextFollowUpDate : currentLead.nextFollowUpDate,
        lastContactedAt: body.lastContactedAt !== undefined ? body.lastContactedAt : currentLead.lastContactedAt,
        notes: body.notes !== undefined ? body.notes : currentLead.notes,
        estimatedValue: body.estimatedValue !== undefined ? body.estimatedValue : currentLead.estimatedValue,
        assignedTo: body.assignedTo !== undefined ? body.assignedTo : currentLead.assignedTo,
        draftStatus: body.draftStatus !== undefined ? body.draftStatus : currentLead.draftStatus,
        auditStatus: body.auditStatus !== undefined ? body.auditStatus : currentLead.auditStatus,
        proposalStatus: body.proposalStatus !== undefined ? body.proposalStatus : currentLead.proposalStatus,
        accStatus: body.accStatus !== undefined ? body.accStatus : currentLead.accStatus,
        followUpCount: body.followUpCount !== undefined ? body.followUpCount : currentLead.followUpCount,
      };

      // Serialize merged values back into DB row
      const { dbRow } = serializeLead(mergedLead, mergedLead.notes);

      // Extra direct DB columns not part of ApiLead shape
      if (body.address !== undefined)       dbRow.address         = body.address;
      if (body.googleMapsUrl !== undefined)  dbRow.google_maps_url = body.googleMapsUrl;

      // Update in DB
      const { data: updatedData, error: updateError } = await supabase
        .from('leads')
        .update(dbRow)
        .eq('id', leadId)
        .select('*')
        .single();

      if (updateError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update lead in database',
          error: updateError.message,
        });
      }

      const responseLead = deserializeLead(updatedData);

      return res.status(200).json({
        success: true,
        message: 'Lead updated successfully',
        data: responseLead,
      });
    }

    // ==========================================
    // DELETE: Soft Delete / Archive Lead
    // ==========================================
    if (req.method === 'DELETE') {
      const mergedLead: ApiLead = {
        ...currentLead,
        status: 'archived',
        archivedAt: new Date().toISOString(),
        deletedAt: new Date().toISOString(),
      };

      const { dbRow } = serializeLead(mergedLead, currentLead.notes);
      dbRow.status = 'archived'; // make sure status is set to archived directly

      const { error: updateError } = await supabase
        .from('leads')
        .update(dbRow)
        .eq('id', leadId);

      if (updateError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to archive lead',
          error: updateError.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: `Lead ${leadId} soft-deleted/archived successfully.`,
      });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('API ID Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}
