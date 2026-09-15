import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const startTime = Date.now();
  
  // Optional security check for Vercel Cron or custom header
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // If CRON_SECRET is configured in env, require it
    return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
  }

  try {
    // Perform a lightweight query to register activity on the Supabase database
    const { data, error } = await supabase
      .from('leads')
      .select('id')
      .limit(1);

    const latencyMs = Date.now() - startTime;

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Supabase query failed during keep-alive ping',
        error: error.message,
        latencyMs,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase keep-alive ping successful. Project is active & awake.',
      rowCount: data?.length ?? 0,
      latencyMs,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
