import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  verifyAgentAuth,
  getSupabaseClient,
  deserializeLead,
  ApiLead,
} from '../_utils/agentHelpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1. Authenticate Request
    if (!verifyAgentAuth(req)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const supabase = getSupabaseClient();

    // Query database for all leads
    const { data: dbLeads, error } = await supabase
      .from('leads')
      .select('*');

    if (error) {
      return res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }

    // Deserialize all leads
    const apiLeads: ApiLead[] = (dbLeads || []).map(deserializeLead);

    // Active leads (exclude soft-deleted or archived ones)
    const activeLeads = apiLeads.filter(
      lead =>
        lead.status !== 'archived' &&
        lead.status !== 'Ditolak' &&
        !lead.archivedAt &&
        !lead.deletedAt
    );

    // Timing helper
    const now = new Date();
    const todayStr = now.toDateString();
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Metrics calculations
    const totalLeads = activeLeads.length;

    const leadsToday = activeLeads.filter(lead => {
      const createdDate = new Date(lead.createdAt);
      return createdDate.toDateString() === todayStr;
    }).length;

    const qualifiedLeads = activeLeads.filter(
      lead => lead.status.toLowerCase() === 'qualified'
    ).length;

    const pendingAcc = activeLeads.filter(
      lead => lead.status.toLowerCase() === 'pending_acc'
    ).length;

    const contactedThisWeek = activeLeads.filter(lead => {
      const isContactedStatus = ['contacted', 'dihubungi'].includes(lead.status.toLowerCase());
      if (isContactedStatus) return true;
      if (lead.lastContactedAt) {
        const lastContactedDate = new Date(lead.lastContactedAt);
        return lastContactedDate >= oneWeekAgo && lastContactedDate <= now;
      }
      return false;
    }).length;

    const replies = activeLeads.filter(
      lead => ['replied', 'reply'].includes(lead.status.toLowerCase())
    ).length;

    const proposalsSent = activeLeads.filter(
      lead => lead.status.toLowerCase() === 'proposal_sent'
    ).length;

    const wonDeals = apiLeads.filter( // Count all deals including historical / archived deals
      lead => ['won', 'deal'].includes(lead.status.toLowerCase())
    ).length;

    const lostDeals = apiLeads.filter(
      lead => ['lost', 'ditolak'].includes(lead.status.toLowerCase())
    ).length;

    // Sum estimated pipeline value robustly
    const pipelineValue = activeLeads.reduce((sum, lead) => {
      if (['lost', 'ditolak', 'won', 'deal'].includes(lead.status.toLowerCase())) {
        // Exclude closed deals from active pipeline value, or include them if preferred?
        // Standard practice: Pipeline value is active pipeline (excluding won/lost),
        // let's sum won + active pipeline value to be robust or just sum all active values.
        return sum; 
      }
      return sum + (lead.estimatedValue || 0);
    }, 0);

    // Breakdown count by status
    const byStatus: Record<string, number> = {};
    activeLeads.forEach(lead => {
      const statusKey = lead.status.toLowerCase();
      byStatus[statusKey] = (byStatus[statusKey] || 0) + 1;
    });

    // Breakdown count by assignedTo
    const byAssignedTo: Record<string, number> = {};
    activeLeads.forEach(lead => {
      const agentKey = lead.assignedTo || 'Well';
      byAssignedTo[agentKey] = (byAssignedTo[agentKey] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalLeads,
        leadsToday,
        qualifiedLeads,
        pendingAcc,
        contactedThisWeek,
        replies,
        proposalsSent,
        wonDeals,
        lostDeals,
        pipelineValue,
        byStatus,
        byAssignedTo,
      },
    });
  } catch (error: any) {
    console.error('API Metrics Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}
