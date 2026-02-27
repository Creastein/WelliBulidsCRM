import { supabase } from '../lib/supabase';
import type { WeeklyReview } from '../data/dataDefaults';

export async function fetchWeeklyReviews(): Promise<WeeklyReview[]> {
    const { data, error } = await supabase
        .from('weekly_reviews')
        .select('*')
        .order('week', { ascending: true });

    if (error) throw new Error(`Gagal memuat weekly reviews: ${error.message}`);
    return (data || []).map(row => ({
        week: row.week,
        dm: row.dm,
        reply: row.reply,
        closing: row.closing,
        revenue: row.revenue,
        notes: row.notes ?? '',
    }));
}

export async function upsertWeeklyReview(review: WeeklyReview): Promise<void> {
    const { error } = await supabase
        .from('weekly_reviews')
        .upsert(
            {
                week: review.week,
                dm: review.dm,
                reply: review.reply,
                closing: review.closing,
                revenue: review.revenue,
                notes: review.notes,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'week' }
        );

    if (error) throw new Error(`Gagal menyimpan weekly review: ${error.message}`);
}

export async function upsertAllWeeklyReviews(reviews: WeeklyReview[]): Promise<void> {
    const rows = reviews.map(r => ({
        week: r.week,
        dm: r.dm,
        reply: r.reply,
        closing: r.closing,
        revenue: r.revenue,
        notes: r.notes,
        updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
        .from('weekly_reviews')
        .upsert(rows, { onConflict: 'week' });

    if (error) throw new Error(`Gagal menyimpan weekly reviews: ${error.message}`);
}
