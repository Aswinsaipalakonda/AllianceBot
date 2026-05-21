# AllianceBot — Production Deployment & Go-Live Guide

Complete step-by-step guide to deploy AllianceBot, connect WhatsApp, test with a few users, and launch so **many students** can chat while **college staff** track leads in the dashboard and Google Sheets.

---

## Table of contents

1. [What you are deploying](#1-what-you-are-deploying)
2. [Prerequisites checklist](#2-prerequisites-checklist)
3. [Phase 1 — Google Sheets (data backbone)](#3-phase-1--google-sheets-data-backbone)
4. [Phase 2 — Google Gemini AI](#4-phase-2--google-gemini-ai)
5. [Phase 3 — Meta WhatsApp Cloud API](#5-phase-3--meta-whatsapp-cloud-api)
6. [Phase 4 — GitHub & local setup](#6-phase-4--github--local-setup)
7. [Phase 5 — Deploy to Vercel](#7-phase-5--deploy-to-vercel)
8. [Phase 6 — Configure production webhook](#8-phase-6--configure-production-webhook)
9. [Phase 7 — Test before go-live (development mode)](#9-phase-7--test-before-go-live-development-mode)
10. [Phase 8 — Go live for all users](#10-phase-8--go-live-for-all-users)
11. [Phase 9 — How college staff track leads](#11-phase-9--how-college-staff-track-leads)
12. [Phase 10 — Daily operations for counselors](#12-phase-10--daily-operations-for-counselors)
13. [Phase 11 — Monitoring & troubleshooting](#13-phase-11--monitoring--troubleshooting)
14. [Security & production hardening](#14-security--production-hardening)
15. [Final launch checklist](#15-final-launch-checklist)

---

## 1. What you are deploying

AllianceBot is a **WhatsApp admissions assistant** for Alliance College. It is not a public website chat widget.

```text
Student (WhatsApp)
    ↓
Meta WhatsApp Cloud API
    ↓
POST https://YOUR_DOMAIN/api/webhook
    ↓
Google Gemini AI (classify + reply)
    ↓
Meta sends reply to student
    ↓
Google Sheets (leads + chat log)
    ↓
Admin dashboard (Vercel-hosted Next.js app)
```

**Admin dashboard pages:**

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/` | KPIs, recent activity, export report |
| Conversations | `/conversations` | WhatsApp-style inbox, manual replies, AI on/off |
| Leads Directory | `/leads` | Search/filter leads, add leads, quick chat |
| Analytics | `/analytics` | Charts and category breakdown |

**Tech stack:** Next.js 16, Vercel, Meta WhatsApp Cloud API, Google Gemini, Google Sheets.

---

## 2. Prerequisites checklist

Before starting, ensure you have:

- [ ] A **GitHub** account and repository for this project
- [ ] A **Vercel** account (recommended host)
- [ ] A **Meta Business** account with WhatsApp Business API access
- [ ] A **WhatsApp Business phone number** (or number linked to your WABA)
- [ ] A **Google Cloud** project with Sheets API enabled
- [ ] A **Google AI Studio** API key (Gemini)
- [ ] College brochure/knowledge content already in the app (`src/lib/brochure.ts`)

**Accounts to create (if not done):**

| Service | Where |
|---------|--------|
| Meta Developer | https://developers.facebook.com |
| Google Cloud Console | https://console.cloud.google.com |
| Google AI Studio | https://aistudio.google.com/apikey |
| Vercel | https://vercel.com |
| GitHub | https://github.com |

---

## 3. Phase 1 — Google Sheets (data backbone)

All leads and conversations are stored in **one Google Spreadsheet**. The service account must have **Editor** access.

### 3.1 Create the spreadsheet

1. Create a new Google Sheet (e.g. `AllianceBot Admissions CRM`).
2. Copy the **Spreadsheet ID** from the URL:  
   `https://docs.google.com/spreadsheets/d/<GOOGLE_SHEET_ID>/edit`

### 3.2 Create tabs (exact names)

Tab names must match exactly (case-sensitive).

#### Tab: `Admissions Leads`

| Column | Header | Description |
|--------|--------|-------------|
| A | Timestamp | Last activity time |
| B | Name | Student name from WhatsApp profile |
| C | Phone | WhatsApp number (with country code) |
| D | Interested Course | BHMCT, BBA, DHM, Undecided |
| E | Lead Status | New Lead, Interested, Follow-up, Applied, Converted |
| F | Lead Category | Course Queries, Placement Queries, Scholarship Queries, Human Followups |
| G | Last Message | Latest student message snippet |
| H | AI Auto Reply | `true` = bot replies; `false` = human takeover |

#### Tab: `Course Queries`

| A | B | C | D | E |
|---|---|---|---|---|
| Timestamp | Phone | Course Asked | User Message | AI Response |

#### Tab: `Placement Queries`

| A | B | C | D |
|---|---|---|---|
| Timestamp | Phone | Query | AI Response |

#### Tab: `Scholarship Queries`

| A | B | C | D |
|---|---|---|---|
| Timestamp | Phone | Query | AI Response |

#### Tab: `Human Followups`

| A | B | C | D | E |
|---|---|---|---|---|
| Timestamp | Counselor Name | Student Phone | Notes | Action Taken |

#### Tab: `Chat Log` (recommended)

The app can auto-create this tab on first message. If you create it manually:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Timestamp | Phone | Name | Sender | Message Text | Buttons | Category | Course |

`Sender` = `user` or `bot`. This tab powers the **Conversations** page history.

### 3.3 Google Cloud service account

1. Google Cloud Console → **APIs & Services** → **Library** → enable **Google Sheets API**.
2. **IAM & Admin** → **Service Accounts** → Create service account (e.g. `alliancebot`).
3. Create a **JSON key** and download it.
4. From the JSON file, copy:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_PRIVATE_KEY`
5. Open your spreadsheet → **Share** → add the service account email as **Editor**.

---

## 4. Phase 2 — Google Gemini AI

1. Go to https://aistudio.google.com/apikey
2. Create an API key for the college project.
3. Save as `GEMINI_API_KEY` (never commit to Git).

The bot uses **Gemini** (`gemini-1.5-flash` by default) with Alliance College brochure context. If Gemini fails, a built-in offline fallback still sends basic replies.

---

## 5. Phase 3 — Meta WhatsApp Cloud API

### 5.1 Create the Meta app

1. https://developers.facebook.com → **My Apps** → **Create App**.
2. Choose type that supports **WhatsApp** (Business).
3. Add product: **WhatsApp** → **Set up**.

### 5.2 Collect credentials

From **WhatsApp → API Setup**:

| Value | Environment variable |
|-------|----------------------|
| Phone number ID | `META_PHONE_NUMBER_ID` |
| Temporary token (for testing only) | — |
| Permanent access token (System User) | `META_PERMANENT_TOKEN` |

**Permanent token (production):**

1. Meta Business Settings → **Users** → **System users** → Add.
2. Assign assets: your WhatsApp Business Account + app.
3. Generate token with permissions including:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
4. Store as `META_PERMANENT_TOKEN`.

### 5.3 Verify token (webhook)

Choose a strong random string (e.g. `Alliance-Bot-Prod-2026-Secret`).  
Set the same value in:

- Meta webhook **Verify token** field
- Vercel env: `META_VERIFY_TOKEN`

**They must match exactly.**

### 5.4 Business display name & number

- Complete **WhatsApp Business Profile** (name, description, address).
- Ensure the phone number students will message is the one tied to `META_PHONE_NUMBER_ID`.

---

## 6. Phase 4 — GitHub & local setup

### 6.1 Clone and install

```bash
git clone https://github.com/YOUR_ORG/AllianceBot.git
cd AllianceBot
npm install
```

### 6.2 Local environment

Copy the example file:

```bash
cp .env.example .env.local
```

Fill `.env.local` with all variables (see [Section 7.2](#72-environment-variables-on-vercel)).  
**Never commit `.env.local`** — it is already in `.gitignore`.

### 6.3 Local run (optional)

```bash
npm run dev
```

Open http://localhost:3000 for the dashboard only.  
WhatsApp webhooks require a **public HTTPS URL** (use Vercel for real testing).

### 6.4 Push to GitHub

```bash
git add .
git commit -m "Prepare AllianceBot for production deployment"
git branch -M main
git remote add origin https://github.com/YOUR_ORG/AllianceBot.git
git push -u origin main
```

---

## 7. Phase 5 — Deploy to Vercel

### 7.1 Import project

1. https://vercel.com → **Add New** → **Project**.
2. Import your GitHub repository.
3. Framework preset: **Next.js** (auto-detected).
4. Build command: `npm run build` (default).
5. Deploy.

Note your production URL, e.g. `https://alliance-bot.vercel.app`.

### 7.2 Environment variables on Vercel

**Project → Settings → Environment Variables**  
Add for **Production** (and Preview if you use staging):

| Variable | Required | Notes |
|----------|----------|-------|
| `META_VERIFY_TOKEN` | Yes | Same as Meta webhook verify token |
| `META_PHONE_NUMBER_ID` | Yes | From WhatsApp API Setup |
| `META_PERMANENT_TOKEN` | Yes | System user permanent token |
| `GEMINI_API_KEY` | Yes | Google AI Studio key |
| `NEXT_PUBLIC_AI_MODEL` | Optional | Default: `gemini-1.5-flash` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Yes | Service account email |
| `GOOGLE_PRIVATE_KEY` | Yes | Full private key; use `\n` for newlines |
| `GOOGLE_SHEET_ID` | Yes | Spreadsheet ID from URL |

**`GOOGLE_PRIVATE_KEY` on Vercel:**

- Paste the key from JSON `private_key`.
- Keep literal `\n` between lines, **or** paste multiline in Vercel’s multiline editor.
- Do not wrap in extra quotes unless your deployment requires it (the code strips outer quotes).

### 7.3 Redeploy after env changes

Every time you change env vars:

**Deployments → … → Redeploy**

Old deployments do not pick up new tokens automatically.

### 7.4 Verify deployment health

Open in browser:

```text
https://YOUR_DOMAIN/api/webhook
```

Expected response:

```json
{
  "success": true,
  "message": "AllianceBot webhook is live. Awaiting Meta verification or incoming messages."
}
```

If you see `Bad Request`, redeploy the latest code from `main`.

---

## 8. Phase 6 — Configure production webhook

1. Meta Developer → your app → **WhatsApp** → **Configuration**.
2. **Callback URL:**

   ```text
   https://YOUR_DOMAIN/api/webhook
   ```

   Example: `https://alliance-bot.vercel.app/api/webhook`

3. **Verify token:** exact value of `META_VERIFY_TOKEN`.
4. Click **Verify and save**.
5. **Webhook fields:** subscribe to **`messages`** (required).

### Webhook verification flow (reference)

Meta sends:

```text
GET /api/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=RANDOM_STRING
```

Your server returns `hub.challenge` when the token matches.

---

## 9. Phase 7 — Test before go-live (development mode)

While the Meta app is in **Development**, only **test phone numbers** added in the Meta console can chat with the bot.

### 9.1 Add test recipients

**WhatsApp → API Setup → Send and receive messages**

- Add your phone (and counselors’ phones) as test numbers.
- Send the opt-in code from WhatsApp if prompted.

### 9.2 End-to-end test

1. From a **registered test phone**, message your WhatsApp Business number.
2. Example messages:
   - `Hi`
   - `Tell me about BHMCT admissions`
   - `What are placement packages?`
3. Confirm:
   - [ ] AI reply arrives on WhatsApp within ~5–15 seconds
   - [ ] Row appears in **Admissions Leads** sheet
   - [ ] Rows appear in **Chat Log** and/or category sheets
   - [ ] Lead shows on dashboard **Conversations** and **Leads**

### 9.3 Test human takeover

1. Open **Conversations** → select the test lead.
2. Turn **AI Auto Reply OFF** (human mode).
3. Send another WhatsApp message from the student phone.
4. Confirm:
   - [ ] No automatic AI reply
   - [ ] **Human Followups** sheet gets a new row
   - [ ] Counselor can send manual reply from dashboard

### 9.4 Test manual counselor reply

1. In **Conversations**, type a message and send.
2. Confirm the student receives it on WhatsApp.
3. Confirm **Chat Log** records `sender=bot` for outbound messages.

### 9.5 Check Vercel logs

**Vercel → Project → Logs** → filter `/api/webhook`

Look for:

- `Received WhatsApp payload`
- `Processing message from...`
- `AI Reply: "..."`
- `Successfully sent WhatsApp message to...`

---

## 10. Phase 8 — Go live for all users

When testing is stable, switch from **Development** to **Live** so **any student** with your business number can chat (subject to Meta limits and policies).

### 10.1 Meta Business verification

- Complete **Business Verification** in Meta Business Manager if required.
- Ensure WhatsApp Business Account is approved for production messaging.

### 10.2 App mode: Development → Live

1. Meta Developer → App → **App Mode** → switch to **Live**.
2. Confirm required permissions are approved (especially WhatsApp messaging).

### 10.3 Messaging limits & tiers

Meta assigns **messaging limits** by tier (e.g. 250, 1K, 10K unique users per 24h).  
Monitor in **WhatsApp Manager** as volume grows.

### 10.4 24-hour customer service window

- After a student messages you, you can send **free-form replies** for **24 hours**.
- Outside that window, you may need **approved message templates** for outbound messages.
- Plan template messages for re-engagement (e.g. “Admissions reminder”) if counselors message cold leads.

### 10.5 Publish the business number

Share the WhatsApp number publicly:

- College website / landing page
- Brochures and social media
- “Message us on WhatsApp for admissions” CTA

**Example student flow:**

1. Student scans QR or taps `wa.me/<countrycode><number>`.
2. Sends first message.
3. Bot greets and answers from brochure knowledge.
4. Lead is logged automatically for counselors.

### 10.6 Remove test-number restriction

In **Live** mode, you do **not** need to add every student as a test recipient.  
Keep a few staff numbers as testers for ongoing checks.

---

## 11. Phase 9 — How college staff track leads

Staff use **two systems**: the **web dashboard** (real-time operations) and **Google Sheets** (records, exports, backups).

### 11.1 Dashboard — Leads Directory (`/leads`)

**Use for:**

- Full list of prospective students
- Search by name or phone (top bar **Ctrl+K** also searches)
- Filter by course, status, category
- Add manual leads (walk-ins, phone inquiries)
- Open **Quick Chat** → jumps to Conversations for that phone

**Lead fields shown:**

- Name, phone, course interest, status, category, last message, AI on/off

### 11.2 Dashboard — Conversations (`/conversations`)

**Use for:**

- WhatsApp-style inbox (all leads with recent activity)
- Read full thread from **Chat Log**
- Toggle **AI Auto Reply** per student
- Send **manual WhatsApp replies** as counselor
- Handle escalations when AI is off

**When AI is ON:** Gemini replies automatically; staff monitor.  
**When AI is OFF:** Student messages go to **Human Followups**; staff must reply manually.

### 11.3 Dashboard — Analytics (`/analytics`)

**Use for:**

- Total leads, active conversations, applications, confirmed admissions
- Category distribution (course / placement / scholarship / human)
- Export-style reporting from main dashboard (`/`)

### 11.4 Dashboard — Home (`/`)

**Use for:**

- Daily KPI snapshot
- Recent activity feed (click through to conversations)
- Download CSV report

### 11.5 Google Sheets — for managers & Excel users

| Sheet | Who uses it | Purpose |
|-------|-------------|---------|
| Admissions Leads | Admissions head | Master CRM list |
| Chat Log | Counselors / audit | Full message history |
| Course Queries | Course coordinators | BHMCT/BBA/DHM questions |
| Placement Queries | Placement cell | Placement-related chats |
| Scholarship Queries | Finance/scholarship | Fee/discount queries |
| Human Followups | Counselors | Needs human callback |

**Tip:** Share the spreadsheet with senior staff (view or edit). Service account rows update automatically from WhatsApp.

### 11.6 Lead categories (automatic)

The AI assigns each message to:

| Category | Typical student questions |
|----------|---------------------------|
| Course Queries | Eligibility, syllabus, courses, admissions process |
| Placement Queries | Companies, packages, internships |
| Scholarship Queries | Discounts, scholarships, fees |
| Human Followups | “Talk to counselor”, angry/complex/off-topic |

---

## 12. Phase 10 — Daily operations for counselors

### Morning routine

1. Open dashboard → **Leads** → sort by latest activity.
2. Check **Human Followups** sheet or filter category = Human Followups.
3. Review **Analytics** for overnight volume.

### Handling a new WhatsApp lead

1. Student messages → AI replies (if AI enabled).
2. Lead appears in **Admissions Leads** + **Chat Log**.
3. Counselor reviews thread in **Conversations**.
4. If needed: disable AI → call student → reply manually in dashboard.

### Closing / converting a lead

1. Update status in **Leads** (Interested → Applied → Converted).
2. Keep AI off during sensitive document/fee discussions.
3. Record notes in **Human Followups** sheet if needed.

### Best practices

- Keep **AI ON** for FAQs; turn **AI OFF** for fee negotiation and angry cases.
- Respond to **Human Followups** within SLA (e.g. 2 business hours).
- Do not share dashboard URL publicly until login protection is added (see [Section 14](#14-security--production-hardening)).

---

## 13. Phase 11 — Monitoring & troubleshooting

### 13.1 Symptom: Student messages, no AI reply

| Check | Action |
|-------|--------|
| Vercel redeployed after token change? | Redeploy |
| `META_PERMANENT_TOKEN` valid? | Regenerate in Meta; update Vercel |
| `META_PHONE_NUMBER_ID` correct? | Match API Setup page |
| Webhook subscribed to `messages`? | Meta Configuration |
| Student in dev mode without test number? | Add number or go Live |
| AI disabled for lead? | Check column H / Conversations toggle |
| Vercel logs show Gemini error? | Verify `GEMINI_API_KEY` billing/quota |

### 13.2 Symptom: Webhook verify fails

- `META_VERIFY_TOKEN` must match Meta field **exactly** (no spaces).
- Callback URL must be `https://YOUR_DOMAIN/api/webhook` (HTTPS, no trailing typo).

### 13.3 Symptom: Dashboard empty but WhatsApp works

- Share Google Sheet with service account (Editor).
- Confirm `GOOGLE_SHEET_ID` and tab names match exactly.
- Check Vercel logs for Sheets API errors.

### 13.4 Symptom: Conversations thread empty

- Confirm **Chat Log** tab has rows for that phone number.
- Phone format: stored as WhatsApp sends it (country code, no `+` inconsistency).

### 13.5 Symptom: Manual send fails

- Same Meta token/phone ID as webhook.
- 24-hour window may block template-free outbound if student has not messaged recently.

### 13.6 Useful URLs

| Check | URL |
|-------|-----|
| Webhook health | `https://YOUR_DOMAIN/api/webhook` |
| Dashboard | `https://YOUR_DOMAIN/` |
| Vercel logs | Vercel project → Logs |
| Meta webhook delivery | Meta Developer → Webhooks → recent deliveries |

---

## 14. Security & production hardening

**Current state:** The dashboard has **no login**. Anyone with the URL can open leads and conversations.

**Before heavy public launch, recommended:**

- [ ] Add authentication (e.g. NextAuth, Clerk, or Vercel password protection)
- [ ] Restrict dashboard to college staff IPs or Google Workspace login
- [ ] Rotate `META_PERMANENT_TOKEN` if ever exposed
- [ ] Never commit `.env.local` or paste tokens in chat/email
- [ ] Use separate Meta **System User** token for production vs testing
- [ ] Enable Vercel **Deployment Protection** for preview URLs
- [ ] Regular backup: Google Sheet → File → Download CSV weekly

---

## 15. Final launch checklist

### Infrastructure

- [ ] GitHub repo up to date
- [ ] Vercel production deploy successful (`npm run build` passes)
- [ ] All 8 environment variables set on Vercel Production
- [ ] Redeploy after last env change

### Google Sheets

- [ ] All 6 tabs exist with correct headers
- [ ] Service account has Editor access
- [ ] Test row written successfully from WhatsApp test

### Meta WhatsApp

- [ ] Webhook verified and saved
- [ ] `messages` field subscribed
- [ ] Permanent token with correct permissions
- [ ] Business profile complete
- [ ] App mode **Live** (for public users)
- [ ] Messaging tier understood for expected volume

### Functional tests

- [ ] Student receives AI reply
- [ ] Lead in Admissions Leads + Chat Log
- [ ] Conversations page shows thread
- [ ] Manual counselor reply delivered
- [ ] AI toggle off → no auto-reply → Human Followups logged
- [ ] Analytics page loads metrics

### College team readiness

- [ ] Staff trained on `/leads` and `/conversations`
- [ ] Escalation process for Human Followups
- [ ] WhatsApp number published on website/marketing
- [ ] Counselor roster and shift coverage defined

---

## Quick reference — environment variables

```env
META_VERIFY_TOKEN=your_secret_verify_token
META_PHONE_NUMBER_ID=your_phone_number_id
META_PERMANENT_TOKEN=your_permanent_system_user_token

GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_AI_MODEL=gemini-1.5-flash

GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_spreadsheet_id
```

---

## Quick reference — production URLs

Replace `YOUR_DOMAIN` with your Vercel domain (e.g. `alliance-bot.vercel.app`):

| Item | Value |
|------|--------|
| Public dashboard | `https://YOUR_DOMAIN/` |
| Webhook callback | `https://YOUR_DOMAIN/api/webhook` |
| Webhook verify token | Value of `META_VERIFY_TOKEN` |

---

## Support workflow summary

```text
Student WhatsApp message
        ↓
   AI ON? ──No──→ Log to Human Followups → Counselor replies manually
        │
       Yes
        ↓
   Gemini + brochure reply → WhatsApp
        ↓
   Sheets + Dashboard updated
        ↓
   Staff monitors Leads / Conversations / Analytics
```

---

*Document version: 1.0 — AllianceBot production deployment guide*
