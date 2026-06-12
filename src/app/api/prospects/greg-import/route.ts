import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Zod Schema for validation
const prospectSchema = z.object({
  businessName: z.string().min(1, "businessName is required"),
  businessType: z.string().optional().default("Uncategorized"),
  location: z.string().optional().default(""),
  address: z.string().optional().nullable(),
  googleMapsUrl: z.string().url("Valid googleMapsUrl is required"),
  websiteUrl: z.string().url().optional().nullable(),
  instagramUrl: z.string().url().optional().nullable(),
  phone: z.string().optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  reviewCount: z.number().min(0).optional().nullable(),
  websiteStatus: z.string().optional().nullable(),
  digitalPresenceIssue: z.string().optional().nullable(),
  suitableOffer: z.string().optional().nullable(),
  prospectScore: z.number().min(1).max(10).optional().nullable(),
  crmNote: z.string().optional().default(""),
  status: z.string().optional().default("new_lead"),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Validate Authorization Bearer token first
    const authHeader = req.headers.get('authorization') || "";
    const expectedToken = process.env.GREG_AGENT_TOKEN?.trim();

    if (!expectedToken) {
      return NextResponse.json({
        success: false,
        message: "Server configuration error: GREG_AGENT_TOKEN is missing"
      }, { status: 500 });
    }

    const receivedToken = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!authHeader || !receivedToken || receivedToken !== expectedToken) {
      console.log("Greg import auth failed", {
        hasAuthHeader: Boolean(authHeader),
        hasExpectedToken: Boolean(expectedToken),
        receivedLength: receivedToken.length,
        expectedLength: expectedToken.length
      });

      return NextResponse.json({
        success: false,
        message: "Unauthorized"
      }, { status: 401 });
    }

    // 2. Initialize Supabase after auth passes
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: 'Missing Supabase credentials in API' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Validate request body
    const bodyJson = await req.json();
    const parsedData = prospectSchema.safeParse(bodyJson);
    if (!parsedData.success) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid request data', 
        errors: parsedData.error.format() 
      }, { status: 400 });
    }

    const data = parsedData.data;
    
    // Default values logic
    let finalStatus = data.status;
    if (!data.businessType || !data.location) {
      finalStatus = 'needs_review';
    }

    // Helper to update crmNote and status if useful
    const handleDuplicateUpdate = async (existing: any, newNote: string, newStatus: string) => {
      const updateData: any = {};
      
      // Update status only if it's currently a new_lead/Belum Dihubungi and the new status is different
      if (existing.status === 'Belum Dihubungi' || existing.status === 'new_lead') {
        if (newStatus !== 'new_lead' && newStatus !== existing.status) {
          updateData.status = newStatus;
        }
      }

      // Update notes
      if (newNote && (!existing.notes || !existing.notes.includes(newNote))) {
        updateData.notes = existing.notes 
          ? `${existing.notes}\n---\nGreg Update: ${newNote}`
          : newNote;
      }

      if (Object.keys(updateData).length > 0) {
        updateData.updated_at = new Date().toISOString();
        await supabase.from('leads').update(updateData).eq('id', existing.id);
      }
    };

    // 4. Check for duplicate by googleMapsUrl
    const { data: existingByMap } = await supabase
      .from('leads')
      .select('id, notes, status')
      .eq('google_maps_url', data.googleMapsUrl)
      .limit(1);

    if (existingByMap && existingByMap.length > 0) {
      const existing = existingByMap[0];
      await handleDuplicateUpdate(existing, data.crmNote, finalStatus);
      return NextResponse.json({ 
        success: true, 
        duplicate: true, 
        message: 'Prospect already exists (matched by Google Maps URL)', 
        prospectId: existing.id 
      }, { status: 200 });
    }

    // 5. Check for duplicate by businessName + address
    if (data.address) {
      const { data: existingByNameAddress } = await supabase
        .from('leads')
        .select('id, notes, status')
        .eq('name', data.businessName)
        .eq('address', data.address)
        .limit(1);

      if (existingByNameAddress && existingByNameAddress.length > 0) {
        const existing = existingByNameAddress[0];
        await handleDuplicateUpdate(existing, data.crmNote, finalStatus);
        return NextResponse.json({ 
          success: true, 
          duplicate: true, 
          message: 'Prospect already exists (matched by Name and Address)', 
          prospectId: existing.id 
        }, { status: 200 });
      }
    }

    // 6. Map to existing schema + new fields and Insert
    const newLeadData = {
      name: data.businessName,
      niche: data.businessType,
      location: data.location,
      priority: 'Medium', // default
      status: finalStatus,
      action: '',
      notes: data.crmNote,
      
      // New mapped fields
      address: data.address,
      google_maps_url: data.googleMapsUrl,
      website_url: data.websiteUrl,
      instagram_url: data.instagramUrl,
      phone: data.phone,
      rating: data.rating,
      review_count: data.reviewCount,
      website_status: data.websiteStatus,
      digital_presence_issue: data.digitalPresenceIssue,
      suitable_offer: data.suitableOffer,
      prospect_score: data.prospectScore,
      
      source: 'google_maps',
      created_by: 'greg',
      updated_at: new Date().toISOString()
    };

    const { data: insertedData, error: insertError } = await supabase
      .from('leads')
      .insert([newLeadData])
      .select('id')
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to insert prospect to database',
        error: insertError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      duplicate: false,
      message: 'Prospect created successfully',
      prospectId: insertedData.id
    }, { status: 200 });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      error: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
