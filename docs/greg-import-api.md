# Greg Prospect Import API

This documentation describes how the `Greg` agent interacts with the WelliBuilds CRM via the import API. 

**Note on Greg Limitations**: 
- Greg **must not** scrape Google Maps directly within this app (he uses OpenClaw/browser tool separately).
- Greg **cannot** auto-DM users directly from this endpoint.
- Greg **cannot** delete existing records via this endpoint (no delete action allowed).
- The purpose is strictly to insert normalized prospect data.

## Endpoint Details

- **URL**: `POST /api/prospects/greg-import`
- **Method**: `POST`
- **Content-Type**: `application/json`

### Required Environment Variables

To run this endpoint securely, your Vercel (or local `.env`) environment must contain:

- `GREG_AGENT_TOKEN`: A secret token used by Greg. (e.g. `your-super-secret-token`)
- `SUPABASE_URL`: Your Supabase project URL. (Falls back to `VITE_SUPABASE_URL` if not set)
- `SUPABASE_SERVICE_ROLE_KEY`: The Supabase service role key, which bypasses Row Level Security (RLS) to ensure background backend inserts always work without requiring an active browser session. **Never expose this to the client/frontend.**

### SQL Migration Required

The API maps some of Greg's data to existing fields in the `leads` table (e.g., `businessName` to `name`, `businessType` to `niche`, `crmNote` to `notes`). However, it also stores new prospect-specific fields. 

Before using the API, run this SQL script in your Supabase SQL Editor to add the required columns:

```sql
ALTER TABLE leads
ADD COLUMN address text,
ADD COLUMN google_maps_url text,
ADD COLUMN website_url text,
ADD COLUMN instagram_url text,
ADD COLUMN phone text,
ADD COLUMN rating numeric(3,1),
ADD COLUMN review_count integer,
ADD COLUMN website_status text,
ADD COLUMN digital_presence_issue text,
ADD COLUMN suitable_offer text,
ADD COLUMN prospect_score integer,
ADD COLUMN source text DEFAULT 'manual',
ADD COLUMN created_by text DEFAULT 'user';
```

## Example JSON Payload

```json
{
  "businessName": "Villa Contoh Bali",
  "businessType": "Villa",
  "location": "Canggu, Bali",
  "address": "Canggu, Kuta Utara, Badung, Bali",
  "googleMapsUrl": "https://maps.app.goo.gl/example",
  "websiteUrl": null,
  "instagramUrl": null,
  "phone": null,
  "rating": 4.7,
  "reviewCount": 128,
  "websiteStatus": "no_website_found",
  "digitalPresenceIssue": "Belum terlihat memiliki website resmi untuk booking langsung.",
  "suitableOffer": "Website villa dengan WhatsApp CTA, direct booking, gallery, rooms, dan local SEO.",
  "prospectScore": 8,
  "crmNote": "Prospek cocok untuk penawaran website direct booking karena aktif di Google Maps tapi belum terlihat punya website resmi.",
  "status": "new_lead"
}
```

## Local Testing (Vercel Dev)

Because this app is a Vite SPA deployed to Vercel, the `api/` directory runs as Vercel Serverless Functions. 
You **cannot** test this endpoint using the standard `npm run dev` script because Vite does not route `/api` paths by default.

To test locally, use the Vercel CLI:
```powershell
# Install vercel globally if you haven't
npm i -g vercel

# Run the dev server
vercel dev
```

Then test the API via PowerShell:

```powershell
curl.exe -X POST "http://localhost:3000/api/prospects/greg-import" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_GREG_AGENT_TOKEN" `
  -d "{\"businessName\":\"Villa Contoh Bali\",\"businessType\":\"Villa\",\"location\":\"Canggu, Bali\",\"address\":\"Canggu, Kuta Utara, Badung, Bali\",\"googleMapsUrl\":\"https://maps.app.goo.gl/example\",\"rating\":4.7,\"reviewCount\":128,\"websiteStatus\":\"no_website_found\",\"digitalPresenceIssue\":\"Belum terlihat memiliki website resmi untuk booking langsung.\",\"suitableOffer\":\"Website villa dengan WhatsApp CTA, direct booking, gallery, rooms, dan local SEO.\",\"prospectScore\":8,\"crmNote\":\"Prospek cocok untuk penawaran website direct booking.\",\"status\":\"new_lead\"}"
```
