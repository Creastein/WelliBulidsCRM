import { supabase } from '../lib/supabase';
import type { Lead } from '../data/dataDefaults';

export async function fetchLeads(): Promise<Lead[]> {
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('id', { ascending: true });

    if (error) throw new Error(`Gagal memuat leads: ${error.message}`);
    return (data || []).map(mapRowToLead);
}

export async function createLead(lead: Omit<Lead, 'id'>): Promise<Lead> {
    const { data, error } = await supabase
        .from('leads')
        .insert([mapLeadToRow(lead)])
        .select()
        .single();

    if (error) throw new Error(`Gagal menambah lead: ${error.message}`);
    return mapRowToLead(data);
}

export async function updateLead(id: number, updates: Partial<Omit<Lead, 'id'>>): Promise<void> {
    const { error } = await supabase
        .from('leads')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw new Error(`Gagal update lead: ${error.message}`);
}

export async function deleteLead(id: number): Promise<void> {
    const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

    if (error) throw new Error(`Gagal hapus lead: ${error.message}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToLead(row: any): Lead {
    return {
        id: row.id,
        name: row.name ?? '',
        niche: row.niche ?? '',
        location: row.location ?? '',
        priority: row.priority ?? 'Medium',
        status: row.status ?? 'Belum Dihubungi',
        action: row.action ?? '',
        notes: row.notes ?? '',
    };
}

function mapLeadToRow(lead: Omit<Lead, 'id'>) {
    return {
        name: lead.name,
        niche: lead.niche,
        location: lead.location,
        priority: lead.priority,
        status: lead.status,
        action: lead.action,
        notes: lead.notes,
        updated_at: new Date().toISOString(),
    };
}
