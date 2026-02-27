import { supabase } from '../lib/supabase';
import type { KpiItem } from '../data/dataDefaults';

export async function fetchKpi(): Promise<KpiItem[]> {
    const { data, error } = await supabase
        .from('kpi')
        .select('*')
        .order('id', { ascending: true });

    if (error) throw new Error(`Gagal memuat KPI: ${error.message}`);
    return data || [];
}

export async function upsertKpiItem(item: { key: string; value: number; target: number }): Promise<void> {
    const { error } = await supabase
        .from('kpi')
        .upsert(
            { key: item.key, value: item.value, target: item.target, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
        );

    if (error) throw new Error(`Gagal update KPI: ${error.message}`);
}

export async function upsertAllKpi(kpiItems: KpiItem[]): Promise<void> {
    const rows = kpiItems.map(item => ({
        key: item.key,
        value: item.value,
        target: item.target,
        updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
        .from('kpi')
        .upsert(rows, { onConflict: 'key' });

    if (error) throw new Error(`Gagal menyimpan KPI: ${error.message}`);
}
