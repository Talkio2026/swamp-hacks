# Mock Transcripts for AI Agent Training & Testing

This folder contains mock sales call transcripts organized by client. Each client folder contains a series of calls showing the progression of the sales relationship.

## Folder Structure

```
mock_transcripts/
├── CLT_001_sarah_chen/           # Successful sale journey
│   ├── call_1_initial_contact.json
│   ├── call_2_demo.json
│   └── call_3_contract_accepted.json
├── CLT_002_david_martinez/       # Rejected after 2 calls
│   ├── call_1_initial_contact.json
│   └── call_2_rejected.json
├── CLT_003_lisa_wong/            # In progress (pending decision)
│   ├── call_1_initial_contact.json
│   └── call_2_demo_in_progress.json
└── README.md
```

## Client Summary

| Client ID | Name | Company | Industry | Phone | Sales Rep | Outcome | Calls |
|-----------|------|---------|----------|-------|-----------|---------|-------|
| CLT_001 | Sarah Chen | Bright Ideas Marketing | Marketing | +15551001001 | Michael | **Accepted** | 3 |
| CLT_002 | David Martinez | Genesis Tech Solutions | Technology | +15551002002 | Jessica | **Rejected** | 2 |
| CLT_003 | Lisa Wong | Nexus Retail Solutions | Retail | +15551003003 | Kevin | **In Progress** | 2 |

## Seeding Data to MongoDB

To upload mock transcripts and clients to MongoDB:

```bash
# Using tsx (recommended)
npx tsx scripts/seed-mock-data.ts

# Or using ts-node
npx ts-node scripts/seed-mock-data.ts
```

This will:
1. Create Client records in the `clients` collection
2. Create Transcript records in the `transcripts` collection
3. All client data will be embedded in each transcript

## Transcript Schema

Each transcript JSON file contains the following fields:

```json
{
  // Client Data (populated from dashboard)
  "clientId": "CLT_XXX",           // Unique client identifier
  "clientName": "Name",            // Client contact name
  "companyName": "Company",        // Client company name
  "industry": "Industry",          // Industry sector
  "contactEmail": "email@co.com",  // Client email
  "contactPhone": "+15551001001",  // Client phone (normalized)
  "salesRepName": "Rep Name",      // Assigned sales rep
  
  // Call Metadata
  "callNumber": 1,                 // Sequential call number
  "callSid": "MOCK_CA_...",        // Unique call identifier
  "recordingSid": "MOCK_RE_...",   // Recording identifier
  "transcriptSid": "MOCK_GT_...",  // Transcript identifier
  "status": "initial_contact",     // Call status (see below)
  "outcome": "interested",         // Call outcome (see below)
  "nextAction": "scheduled_demo",  // Next scheduled action
  "createdAt": "2026-01-...",      // Timestamp
  "sentiment": "positive",         // Overall sentiment
  
  // Conversation
  "conversation": [                // Array of dialogue turns
    {
      "speaker": "client|sales_representative",
      "text": "...",
      "start": 0.0,
      "end": 3.12
    }
  ]
}
```

## Status Values

- `initial_contact` - First call with prospect
- `demo` - Product demonstration
- `followup` - Follow-up call
- `negotiation` - Contract negotiation
- `contract_accepted` - Deal closed successfully
- `rejected` - Deal lost
- `in_progress` - Ongoing evaluation

## Outcome Values

- `interested` - Client expressed interest
- `hesitant_interest` - Client showed cautious interest
- `very_interested` - Strong buying signals
- `pending_decision` - Awaiting internal approval
- `closed_won` - Contract signed
- `closed_lost` - Deal not successful
- `rejected` - Client declined

## API Endpoints

### Clients
- `POST /api/clients` - Add a new client
- `GET /api/clients` - List all clients
- `GET /api/clients?phone=+15551001001` - Get client by phone
- `GET /api/clients?clientId=CLT_001` - Get client by ID
- `PATCH /api/clients` - Update a client

### Calls
- `POST /api/clients/[clientId]/call` - Initiate a call to a client

## How It Works

1. **Add Client**: Sales rep adds client via dashboard with all details
2. **Initiate Call**: Click "Call" button on client → creates call-client mapping
3. **Call Happens**: Twilio handles the call and recording
4. **Transcript Returns**: Webhook merges client data with transcript
5. **Data Complete**: AI agents can access full context (client + conversation)

## ID Format

- **Client ID**: `CLT_XXX` (e.g., CLT_001, CLT_002)
- **Phone**: `+1XXXXXXXXXX` (normalized E.164 format)
- **Call SID**: `MOCK_CA_CLTXXX_CALLYYY` (e.g., MOCK_CA_CLT001_CALL001)
- **Recording SID**: `MOCK_RE_CLTXXX_CALLYYY`
- **Transcript SID**: `MOCK_GT_CLTXXX_CALLYYY`
