# AllianceBot — Updated Development Plan

# PLAN.md

---

# 1. Project Overview

AllianceBot is a WhatsApp AI Admissions Chatbot built specifically for:

## Alliance College of Hotel Management & Business Management

Visakhapatnam

This chatbot is ONLY for Alliance College.

The chatbot should:

* answer student admission queries
* provide course information
* answer placement questions
* explain facilities and infrastructure
* guide students toward admissions
* collect student leads
* show all conversations inside a realtime dashboard
* store leads and chats inside Google Sheets

This is NOT a generic chatbot platform.

This is a dedicated WhatsApp admissions assistant for Alliance College.

---

# 2. Final MVP Architecture

```txt
Student
   ↓
WhatsApp
   ↓
Meta WhatsApp Cloud API
   ↓
Next.js Webhook API
   ↓
OpenRouter AI
   ↓
AI Generates Response
   ↓
Send Reply to Student
   ↓
Store Data in Google Sheets
   ↓
Dashboard Shows All Conversations
```

---

# 3. Final Tech Stack

## Frontend

* Next.js
* TailwindCSS

---

## Backend

* Next.js API Routes

---

## Data Storage

* Google Sheets

---

## AI

* OpenRouter API

---

## Messaging Platform

* Meta WhatsApp Cloud API

---

# 4. Core System Features

## Student Features

Students should be able to:

* ask admission questions
* ask course details
* ask placement questions
* ask eligibility questions
* ask hostel and infrastructure questions
* request counselor support

---

## Admin Features

College admins should be able to:

* view all conversations
* monitor student interactions
* search chats
* manually reply to students
* track leads
* monitor admissions enquiries

---

# 5. Dashboard Vision

The dashboard should feel like:

## WhatsApp Web meets Modern CRM

The dashboard will use a **multi-page navigation** structure:

* **Conversations Page**: Dedicated WhatsApp-style chat interface with realtime lead tracking.
* **Analytics Page**: Metrics on leads, conversation volume, application success rates.
* **Settings/Others Page**: For AI prompt management and counselor configurations.

The UI should NOT feel like:
* ERP software
* complex legacy admin systems

---

# 6. Development Roadmap

# Phase 1 — Meta WhatsApp Setup

# Step 1 — Create Meta Developer Account

Go to:

[https://developers.facebook.com/](https://developers.facebook.com/)

---

## Actions

1. Login with Facebook account
2. Click "Get Started"
3. Verify developer account
4. Accept Meta developer terms

---

# Step 2 — Create Meta App

## Actions

1. Open Developer Dashboard
2. Click "Create App"
3. Select:

   * Business
4. Enter app details
5. Create app

---

# Step 3 — Add WhatsApp Product

## Actions

1. Open app dashboard
2. Click "Add Product"
3. Select:

   * WhatsApp
4. Click Setup

---

# Step 4 — Access WhatsApp API Credentials

Meta provides:

* Temporary Access Token
* Test Phone Number
* Phone Number ID
* WhatsApp Business Account ID

Store these securely.

---

# Step 5 — Create Permanent Access Token

## Actions

1. Open Meta Business Settings
2. Create System User
3. Assign permissions
4. Generate permanent token

Required permissions:

* whatsapp_business_management
* whatsapp_business_messaging

---

# Step 6 — Add Real WhatsApp Number

## Actions

1. Add business number
2. Verify using OTP
3. Connect number to Cloud API

IMPORTANT:
The number should not already be active on normal WhatsApp.

---

# Step 7 — Configure Webhook

Meta requires a webhook URL.

Purpose:

* receive student messages
* receive message events

---

## Required Endpoints

### GET Endpoint

Used for webhook verification.

### POST Endpoint

Used for receiving messages.

---

# Step 8 — Verify Webhook

Meta sends:

* hub.challenge
* hub.verify_token

Your app must:

* validate token
* return challenge

---

# Step 9 — Subscribe to Events

Enable:

* messages
* message deliveries
* message reads

---

# Phase 2 — Next.js Project Setup

# Step 10 — Install Node.js

Install:

* Node.js LTS version

Verify installation:

* node -v
* npm -v

---

# Step 11 — Create Next.js Application

Create project with:

* Next.js
* TypeScript
* TailwindCSS
* App Router

---

# Step 12 — Setup Project Structure

Recommended folders:

```txt
/app
/components
/lib
/services
/utils
/types
/hooks
```

---

# Step 13 — Install Required Packages

Install packages for:

* Google Gemini AI SDK
* Google Sheets API
* WhatsApp API requests
* Environment variables

---

# Step 14 — Configure Environment Variables

Create:

* .env.local

Store:

* Meta tokens
* Gemini API key
* Google credentials
* Verify token
* Phone number ID

---

# Phase 3 — Google Sheets Setup

# Step 15 — Create Google Cloud Project

Go to:

[https://console.cloud.google.com/](https://console.cloud.google.com/)

---

# Step 16 — Enable APIs

Enable:

* Google Sheets API
* Google Drive API

---

# Step 17 — Create Service Account

Generate:

* JSON credentials file

---

# Step 18 — Create Google Sheets

Create one spreadsheet for AllianceBot.

---

## Sheet 1 — Admissions Leads

Columns:

* Timestamp
* Name
* Phone
* Interested Course
* Lead Status
* Lead Category
* Last Message

---

## Sheet 2 — Course Queries

Columns:

* Timestamp
* Phone
* Course Asked
* User Message
* AI Response

---

## Sheet 3 — Placement Queries

Columns:

* Timestamp
* Phone
* Query
* AI Response

---

## Sheet 4 — Scholarship Queries

Columns:

* Timestamp
* Phone
* Query
* AI Response

---

## Sheet 5 — Human Followups

Columns:

* Timestamp
* Counselor Name
* Student Phone
* Notes
* Action Taken

---

# Step 19 — Share Sheets with Service Account

Grant:

* Editor access

---

# Phase 4 — Google Gemini AI Setup

# Step 20 — Create Google AI Studio Account

Go to:

[https://aistudio.google.com/](https://aistudio.google.com/)

---

# Step 21 — Generate API Key

Create:

* Gemini API Key

Store securely.

---

# Step 22 — Select AI Model

Recommended:

* Gemini 1.5 Flash
* Gemini 1.5 Pro

For MVP:
Use Gemini 1.5 Flash for high speed and low latency.

---

# Step 23 — Create AI System Prompt

The AI should:

* answer only Alliance College questions
* avoid hallucinations
* use brochure knowledge
* guide students toward admissions
* remain professional

The AI should NOT:

* answer unrelated questions
* invent fee structures
* invent placements
* provide false information

---

# Phase 5 — Build WhatsApp Webhook

# Step 24 — Create Webhook API Route

Create:

* GET verification handler
* POST message handler

---

# Step 25 — Handle Incoming Messages

Extract:

* student phone number
* student name
* message content
* WhatsApp message ID

---

# Step 26 — Ignore Unsupported Events

Ignore:

* status events
* delivery updates
* read receipts

---

# Step 27 — Send User Message to AI

AI input should contain:

* system prompt
* Alliance College brochure context
* recent conversation
* current message

---

# Step 28 — Generate AI Response

Send request to:

* Gemini API (`@google/genai` or `@google/generative-ai`)

Receive:

* AI-generated response

---

# Step 29 — Send Reply Back to Student

Use:

* Meta Graph API

Send WhatsApp reply.

---

# Step 30 — Store Data in Google Sheets

Automatically categorize queries.

Examples:

* admissions query
* placement query
* scholarship query
* course query

Append data to corresponding sheets.

---

# Phase 6 — Build Multi-Page Dashboard UI

# Step 31 — Create Global Layout & Navigation

Build:

* Left global sidebar navigation (Conversations, Analytics, Settings)
* Responsive design prioritizing desktop/tablet views

---

# Step 32 — Build Conversations Page

Build:

* left sidebar (chat list)
* center chat window
* right lead details panel
* WhatsApp-style messaging interface

---

# Step 33 — Build Analytics Page

Display:

* high-level KPIs (Total Leads, Active Conversations)
* visual charts and trend indicators
* date-range filtering

---

# Step 34 — Search & Filtering Engine

Allow filtering chats/leads by:

* course
* lead type
* date
* priority tags

---

# Phase 7 — Human Admin Features

# Step 36 — Manual Human Reply

Admin should be able to:

* manually send WhatsApp replies
* override AI
* continue conversations manually

---

# Step 37 — AI/Human Mode Toggle

Modes:

* AI mode
* Human mode

AI mode:

* AI automatically replies

Human mode:

* Admin manually replies

---

# Phase 8 — Testing

# Step 38 — Test Webhook

Verify:

* incoming messages
* verification flow
* message handling

---

# Step 39 — Test AI Responses

Verify:

* AI stays on-topic
* responses remain college-focused
* no hallucinations

---

# Step 40 — Test Google Sheets Updates

Verify:

* rows append correctly
* categorization works
* timestamps are accurate

---

# Step 41 — Test Dashboard

Verify:

* conversations display correctly
* chats update instantly
* manual replies work
* filters work

---

# Phase 9 — Deployment

# Step 42 — Push Project to GitHub

Create:

* GitHub repository

---

# Step 43 — Deploy Application

Recommended:

* Vercel

Alternative:

* VPS hosting

---

# Step 44 — Configure Production Variables

Add:

* Meta credentials
* OpenRouter key
* Google credentials

---

# Step 45 — Configure Production Webhook

Update webhook URL in:

* Meta Developer Dashboard

---

# Step 46 — Final Production Testing

Verify:

* WhatsApp replies
* AI responses
* dashboard functionality
* Google Sheets updates
* admin replies

---

# Future Improvements

Future enhancements:

* multilingual support
* voice note support
* analytics dashboard
* AI follow-up generation
* counselor assignment
* smart lead scoring

---

# Final MVP Objective

The final product should:

* answer Alliance College admission queries automatically
* collect student leads
* display all conversations in a WhatsApp-style dashboard
* allow admin intervention
* organize leads inside Google Sheets
* help Alliance College manage admissions efficiently

The product identity is:

"WhatsApp Web for Alliance College Admissions Team"

---

# End of PLAN.md
