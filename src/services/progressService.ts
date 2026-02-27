import { supabase } from '../lib/supabase';
import type { ProgressData } from '../data/dataDefaults';

export async function fetchProgress(): Promise<ProgressData | null> {
    const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('id', 1)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw new Error(`Gagal memuat progress: ${error.message}`);
    }
    if (!data) return null;

    return {
        target: data.target,
        current: data.current,
        clientsNeeded: data.clients_needed,
        targetDate: data.target_date,
        avgDealValue: data.avg_deal_value,
    };
}

export async function saveProgress(progress: ProgressData): Promise<void> {
    const { error } = await supabase
        .from('progress')
        .upsert(
            {
                id: 1,
                target: progress.target,
                current: progress.current,
                clients_needed: progress.clientsNeeded,
                target_date: progress.targetDate,
                avg_deal_value: progress.avgDealValue,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
        );

    if (error) throw new Error(`Gagal menyimpan progress: ${error.message}`);
}
