# 🎓 AllianceBot — AI Admissions & CRM Intelligence Platform

<p align="center">
  <img src="public/logo.png" alt="AllianceBot Logo" width="120" height="120" onerror="this.style.display='none'" />
</p>

<p align="center">
  <strong>Intelligent WhatsApp Admissions Assistant & Real-Time CRM Platform</strong><br>
  Built for <em>Alliance College of Hotel Management & Business Management</em> (Affiliated to Andhra University, Visakhapatnam)
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/WhatsApp_Cloud_API-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp Cloud API" />
  <img src="https://img.shields.io/badge/Google_Sheets_API-34A853?style=for-the-badge&logo=googlesheets&logoColor=white" alt="Google Sheets" />
</p>

---

## 📌 Executive Summary

**AllianceBot** is an enterprise-grade AI admissions automation system and real-time CRM suite designed to streamline prospective student inquiries, qualify academic leads, and coordinate admissions operations at scale.

By unifying **Meta's WhatsApp Business Cloud API**, **Google Gemini generative AI models**, and a zero-latency **Google Sheets cloud database**, AllianceBot autonomously answers candidate inquiries (courses, eligibility, fee structures, hostel, scholarships, global placements), collects prospective applicant details, and powers a centralized management dashboard with live human-in-the-loop intervention.

---

## ⚡ Core Capabilities & Highlights

| Feature | Description |
| :--- | :--- |
| 🤖 **Autonomous AI Counselor** | Powered by Google Gemini (`gemini-1.5-flash`), grounded with verified college brochures and curriculum knowledge bases. |
| 🛡️ **Zero-Downtime Rule Fallback** | Instant deterministic fallback engine that guarantees immediate responses if upstream AI quotas or network routes throttle. |
| 📱 **Interactive WhatsApp UI** | Dynamic quick-reply interactive buttons (Explore Courses, Placements, Fee Structure, Talk to Counselor) tailored to candidate intent. |
| 🔄 **Human-in-the-Loop Takeover** | Seamlessly pause AI for specific student threads, allowing admission counselors to take manual control directly from the dashboard. |
| 📊 **Real-time Admissions CRM** | Live multi-metric dashboard featuring conversion funnels, pipeline statuses (*New Lead*, *Follow-up*, *Admitted*), and conversation feeds. |
| 📄 **Automated Form Sync** | Google Apps Script webhook trigger (`FormSubmitTrigger.js`) instantly logs external Google Form applications into the CRM. |
| 📥 **Sanitized Data Export** | One-click admissions registry CSV export engineered with formula injection defenses to protect against spreadsheet vulnerabilities. |
| 🔒 **Stateless Session Security** | Crypto-signed HMAC SHA-256 session management and edge middleware route protection without database session overhead. |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Prospective Students
        A[Applicant on WhatsApp]
        F[Applicant submits Google Form]
    end

    subgraph Meta & Ingestion
        B[Meta WhatsApp Cloud API]
        G[Google Apps Script Trigger]
    end

    subgraph Next.js Core Platform
        C[Webhook Gateway /api/webhook]
        H[Form Ingestion /api/webhook/form]
        D{Active Mode?}
        E1[Google Gemini AI Engine]
        E2[Deterministic Fallback Engine]
        I[Live Chat & Human Takeover Hub]
        J[Web Admin & Analytics Portal]
    end

    subgraph Data & Storage Layer
        K[(Google Sheets Data Warehouse)]
        L[Admissions Registers & Transcripts]
    end

    A <-->|Interactive Messages & Buttons| B
    B <-->|Payloads & Verification| C
    F -->|Submission Event| G
    G -->|POST JSON| H

    C --> D
    D -->|AI Enabled| E1
    D -->|Quota Exceeded / Offline| E2
    D -->|Human Takeover Active| I

    E1 --> C
    E2 --> C
    I <-->|Counselor Reply / Toggle AI| C

    C -->|Read / Write Leads & History| K
    H -->|Append Lead| K
    J <-->|Live Telemetry & CSV Reports| K
    K --- L
```

---

## 🛠️ Technology Stack

- **Frontend & App Framework:** [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Language & Typings:** [TypeScript 5](https://www.typescriptlang.org/)
- **Styling & Design System:** [Tailwind CSS v4](https://tailwindcss.com/) with Lucide React icons
- **Artificial Intelligence:** [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai) (`gemini-1.5-flash` / `gemini-1.5-pro`)
- **Messaging Infrastructure:** [Meta WhatsApp Business Cloud API v20.0](https://developers.facebook.com/docs/whatsapp/cloud-api)
- **Data Persistence & Warehousing:** [Google Sheets API v4](https://developers.google.com/sheets/api) via Google APIs Node client & Google Service Account
- **Authentication & Security:** HMAC SHA-256 signed session tokens stored in secure HttpOnly cookies + Next.js Edge Middleware

---

## 📂 Project Organization

```text
AllianceBot/
├── public/                 # Static visual assets and icons
├── scripts/
│   ├── FormSubmitTrigger.js# Google Apps Script for online application synchronization
│   └── setupSheets.js      # Automated spreadsheet header and schema provisioner
├── src/
│   ├── app/
│   │   ├── (auth)/login/   # Director & Counselor authentication portal
│   │   ├── analytics/      # Performance metrics, conversion charts & funnel telemetry
│   │   ├── conversations/  # Live chat interface with Human Takeover & AI toggle controls
│   │   ├── leads/          # Admissions pipeline, lead status board & candidate records
│   │   ├── api/
│   │   │   ├── analytics/  # Lead conversion and status aggregation endpoints
│   │   │   ├── auth/       # Secure session sign-in / sign-out handlers
│   │   │   ├── conversations/ # Message streaming, send actions & AI toggle
│   │   │   ├── leads/      # Candidate lead registry and update operations
│   │   │   └── webhook/    # Meta Graph API verification & webhook receivers
│   │   ├── globals.css     # Tailwind styling tokens and design specifications
│   │   ├── layout.tsx      # Persistent application frame & navigation shell
│   │   └── page.tsx        # Command dashboard overview and KPI metric cards
│   ├── components/         # Reusable design components (TopBar, GlobalSidebar, etc.)
│   ├── lib/
│   │   ├── auth.ts         # Web Crypto HMAC session encryption and verification
│   │   ├── brochure.ts     # Institutional knowledge base & academic curriculum text
│   │   ├── gemini.ts       # AI prompt synthesis, classification & offline fallback
│   │   └── googleSheets.ts # Google Sheets v4 CRUD connectors and transaction locks
│   └── middleware.ts       # Edge route protection & credential gating
├── .env.example            # Environment variable configuration template
├── package.json            # Runtime dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure the following runtimes and services are available:
- **Node.js** `>= 18.17.0` (or Node.js 20+ LTS recommended)
- **npm**, **pnpm**, or **yarn**
- **Meta Developer Account** with a configured WhatsApp Business Cloud App
- **Google Cloud Console Project** with Google Sheets API enabled and a Service Account
- **Google AI Studio API Key** for Gemini

---

### 2. Installation & Setup

Clone the repository and install project dependencies:

```bash
git clone https://github.com/Aswinsaipalakonda/AllianceBot.git
cd AllianceBot
npm install
```

---

### 3. Environment Configuration

Create a local environment file by copying `.env.example`:

```bash
cp .env.example .env.local
```

Populate the required secrets in `.env.local`:

```env
# Meta WhatsApp API Credentials
META_VERIFY_TOKEN=your_secure_verification_token
META_PHONE_NUMBER_ID=your_meta_phone_number_id
META_PERMANENT_TOKEN=your_meta_system_user_token

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_AI_MODEL=gemini-1.5-flash

# Google Sheets CRM Backend
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_google_spreadsheet_id

# Dashboard Access & Authentication
AUTH_EMAIL=admin@alliance.edu
AUTH_PASSWORD=YourSecurePasswordHere
JWT_SECRET=your_cryptographic_random_secret_string
```

---

### 4. Database (Spreadsheet) Provisioning

Run the automated provisioning script to format the target Google Spreadsheet tabs (`Leads`, `Chat_History`, `Form_Submissions`):

```bash
node scripts/setupSheets.js
```

---

### 5. Running the Application

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Webhook Setup & Live Testing

1. Use a tunneling solution (e.g. `ngrok` or `cloudflared`) to expose your local Next.js server:
   ```bash
   ngrok http 3000
   ```
2. Navigate to your **Meta App Dashboard > WhatsApp > Configuration**.
3. Set the **Callback URL** to:
   ```text
   https://<YOUR-TUNNEL-DOMAIN>/api/webhook
   ```
4. Enter the matching `META_VERIFY_TOKEN` configured in your `.env.local`.
5. Under **Webhook fields**, subscribe to `messages`.
6. Send a test WhatsApp message to your registered business number to observe instant AI qualification and live CRM dashboard updates!

---

## 🔒 Security & Data Hygiene

- **Signature Verification:** WhatsApp webhook endpoints inspect and validate incoming Meta challenge parameters.
- **Formula Injection Mitigation:** Tab-delimited formatting and sanitized quotation shielding are applied across CSV generation pipelines to block spreadsheet injection vectors (`=`, `+`, `-`, `@`).
- **Secret Isolation:** Private keys and tokens are restricted to secure server-side execution boundaries and never exposed via client bundles.

---

## 📄 License

This project is maintained for **Alliance College of Hotel Management & Business Management**. All rights reserved.
