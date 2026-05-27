# AI Agent CRM API Documentation

Welcome! This document defines how AI agents (such as **OpenClaw**, **Adrian**, **Greg**, **Rio**, **Niko**, and **Well**) interact with the WelliBuilds CRM through the secure REST API.

---

## 🔒 Authentication & Authorization

All requests to the `/api/agent/*` endpoints **MUST** include an `Authorization` header with a valid Bearer Token.

```http
Authorization: Bearer YOUR_AGENT_API_TOKEN
```

### Supported Tokens
The API validates the token against the following environment variables on the server:
- `AGENT_API_TOKEN` (Primary token)
- `ADRIAN_AGENT_TOKEN` (Adrian's specific token)
- `GREG_AGENT_TOKEN` (Greg's specific token)
- `RIO_AGENT_TOKEN` (Rio's specific token)
- `OPENCLAW_AGENT_TOKEN` (OpenClaw's specific token)

---

## 🚦 Business Rules & Pipelines

### 1. ⚠️ The ACC (Approval) Rule
- **READ/WRITE permissions**: Agents are permitted to search, list, create, and update leads in the CRM database.
- **Outbound contact rule**: Agents **MUST NOT** contact any prospect directly (via WhatsApp, email, or DM) unless the prospect's `accStatus` is explicitly marked as `'approved'` or approved by the human supervisor **Well**.
- Agents can set `accStatus = 'pending_acc'` to request approval for contacting a qualified prospect.

### 2. 📉 Pipeline Statuses
Agents should use the following standard statuses for the pipeline:
- `new`: A newly identified lead.
- `qualified`: Lead is validated and fits the target persona.
- `need_audit`: Lead requires a manual/digital presence audit.
- `draft_ready`: Audit draft or demo proposal is ready.
- `pending_acc`: Requesting human review and ACC to initiate contact.
- `contacted`: Initial outreach completed.
- `replied`: Prospect replied.
- `proposal_sent`: Custom solution proposal sent.
- `negotiation`: Negotiation on packages/pricing in progress.
- `won`: Deal successfully closed (mapped to `Deal` in the UI).
- `lost`: Prospect rejected the offer (mapped to `Ditolak` in the UI).
- `follow_up_later`: Put on hold, scheduled for later follow-up.
- `archived`: Lead soft-deleted/removed from active views.

### 3. 👥 Assigned Agents
The CRM supports assigning agents to follow up on prospects:
- `Adrian`
- `Greg`
- `Rio`
- `Niko`
- `Well` (Human Agent)

---

## 📡 API Endpoints Reference

### Base URLs
- **Local Dev Server**: `http://localhost:3000` (Use Vercel Dev: `vercel dev` or custom proxy)
- **Production Server**: `https://wellibuilds-crm.vercel.app` (or your actual Vercel deployment URL)

---

### 1. List Active Leads
Returns a list of all active (non-archived) leads.

- **Method**: `GET`
- **URL**: `/api/agent/leads`
- **Query Parameters (Optional)**:
  - `status`: Filter by status (e.g., `new`, `qualified`, `contacted`, `won`, `lost`, `archived`). Note: `status=archived` returns archived/soft-deleted leads.
  - `assignedTo`: Filter by assigned agent (e.g., `Adrian`, `Greg`, `Rio`).
  - `category`: Filter by category (e.g., `villa`, `homestay`, `toko-online`).
  - `q`: Free-text search term matching `name`, `businessName`, `location`, `whatsapp`, `notes`.

#### Example Curl
```bash
curl -X GET "http://localhost:3000/api/agent/leads?status=qualified&assignedTo=Adrian" \
  -H "Authorization: Bearer YOUR_AGENT_API_TOKEN"
```

---

### 2. Create a Lead
Creates a new lead in the CRM.

- **Method**: `POST`
- **URL**: `/api/agent/leads`
- **Headers**: `Content-Type: application/json`

#### Payload Schema (JSON)
- `businessName` (string, required): Full name of the business.
- `name` (string, optional): Short display name. Defaults to `businessName`.
- `category` (string, optional): Category ID (e.g., `villa`, `homestay`, `restoran-cafe`, `toko-online`).
- `location` (string, optional): Physical region/city (e.g., `Canggu, Bali`).
- `address` (string, optional): Detailed street address.
- `googleMapsUrl` (string, url, optional): Google Maps link.
- `instagram` (string, url, optional): Instagram link.
- `website` (string, url, optional): Existing website.
- `whatsapp` (string, optional): Phone/WhatsApp contact number.
- `email` (string, email, optional): Contact email.
- `painPoint` (string, optional): Identified digital presence issues.
- `offerFit` (string, optional): Recommended solution/package.
- `score` (number 1-10, optional): Priority score calculated by agent.
- `status` (string, optional): Initial status. Defaults to `new`.
- `notes` (string, optional): Core qualitative findings.
- `estimatedValue` (number, optional): Estimated deal value in IDR.
- `assignedTo` (string, optional): Agent assigned (e.g., `Adrian`, `Greg`, `Rio`). Defaults to `Well`.

#### Duplicate Detection Rules (Response)
- **Strong Duplicate**: If `googleMapsUrl` or `name` + `address` matches an existing entry, the API **blocks creation** and returns:
  `{ "success": true, "duplicate": true, "duplicateType": "strong_gmaps", "prospectId": X, "message": "..." }`
- **Soft Warning**: If the business name is *similar* to an existing prospect, it creates the lead anyway but returns a `"warning"` message inside the JSON response.

#### Example Curl
```bash
curl -X POST "http://localhost:3000/api/agent/leads" \
  -H "Authorization: Bearer YOUR_AGENT_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Uluwatu Luxury Villa",
    "category": "villa",
    "location": "Uluwatu, Bali",
    "address": "Jalan Labuan Sait No. 45, Pecatu, Uluwatu, Bali",
    "googleMapsUrl": "https://maps.google.com/?cid=12345678",
    "whatsapp": "+628123456789",
    "email": "booking@uluwatuluxuryvilla.com",
    "painPoint": "Outdated website with broken booking form, no responsive mobile layout.",
    "offerFit": "Direct booking engine website + mobile design optimization",
    "score": 9,
    "status": "new",
    "estimatedValue": 4000000,
    "assignedTo": "Adrian",
    "notes": "Excellent location, high pricing on Airbnb, but missing dynamic booking on own site."
  }'
```

---

### 3. Retrieve Lead Detail
Retrieves detailed fields of a specific lead by ID, automatically parsing serializable metadata fields.

- **Method**: `GET`
- **URL**: `/api/agent/leads/:id`

#### Example Curl
```bash
curl -X GET "http://localhost:3000/api/agent/leads/262" \
  -H "Authorization: Bearer YOUR_AGENT_API_TOKEN"
```

---

### 4. Update Partial Lead (PATCH)
Modifies fields on a lead. Unspecified fields are left unchanged. Metadatas are securely merged.

- **Method**: `PATCH`
- **URL**: `/api/agent/leads/:id`
- **Headers**: `Content-Type: application/json`

#### Example Curl (Requesting ACC approval)
```bash
curl -X PATCH "http://localhost:3000/api/agent/leads/262" \
  -H "Authorization: Bearer YOUR_AGENT_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "pending_acc",
    "accStatus": "pending_acc",
    "notes": "Audit draft proposal completed! Requesting ACC from Well to initiate outreach."
  }'
```

---

### 5. Soft Delete / Archive Lead (DELETE)
Soft-deletes a lead. It marks the status as `'archived'` and saves `archivedAt` inside the metadata JSON, keeping it out of default active lists while maintaining database integrity.

- **Method**: `DELETE`
- **URL**: `/api/agent/leads/:id`

#### Example Curl
```bash
curl -X DELETE "http://localhost:3000/api/agent/leads/262" \
  -H "Authorization: Bearer YOUR_AGENT_API_TOKEN"
```

---

### 6. Pipeline Metrics Dashboard
Calculates robust, real-time pipeline metrics for the agent dashboard. Robustly processes old/new data with or without metadata parsed.

- **Method**: `GET`
- **URL**: `/api/agent/metrics`

#### Response Example
```json
{
  "success": true,
  "data": {
    "totalLeads": 256,
    "leadsToday": 4,
    "qualifiedLeads": 12,
    "pendingAcc": 3,
    "contactedThisWeek": 18,
    "replies": 7,
    "proposalsSent": 5,
    "wonDeals": 4,
    "lostDeals": 2,
    "pipelineValue": 18500000,
    "byStatus": {
      "new": 21,
      "qualified": 12,
      "pending_acc": 3,
      "contacted": 18,
      "won": 4
    },
    "byAssignedTo": {
      "Well": 242,
      "Adrian": 6,
      "Greg": 5,
      "Rio": 3
    }
  }
}
```

#### Example Curl
```bash
curl -X GET "http://localhost:3000/api/agent/metrics" \
  -H "Authorization: Bearer YOUR_AGENT_API_TOKEN"
```

---

### 7. Seed Database (Mock Data)
Seeds the database with 3 mock Villa/Homestay leads and 1 mock UMKM lead if they do not already exist (checking by name). Safe to run repeatedly.

- **Method**: `POST` or `GET`
- **URL**: `/api/agent/seed-leads`

#### Example Curl
```bash
curl -X POST "http://localhost:3000/api/agent/seed-leads" \
  -H "Authorization: Bearer YOUR_AGENT_API_TOKEN"
```
