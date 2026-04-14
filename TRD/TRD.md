Here’s a **clean, build-focused TRD** optimized for **stability + fast MVP delivery (no overengineering)**.

---

# ⚙️ Technical Requirement Document (TRD)

## Product: Notion2PDF (MVP)

---

# 1. 🏗 System Architecture Overview

### 🎯 Architecture Type:

**Simple client-server (stateless backend)**

```
Frontend (React)
        ↓
Backend API (Node.js)
        ↓
Processing Layer (Parser + Formatter + PDF Generator)
        ↓
Temporary Storage (optional: memory / temp files)
```

---

### 🧠 Key Principles:

* Stateless backend (no user accounts)
* No database required for MVP (optional logging only)
* Synchronous processing (simple request → response)
* Minimal infra → faster launch

---

# 2. 💻 Frontend Responsibilities

### 🎯 Tech Stack:

* React (Vite or Next.js)
* TailwindCSS (fast UI)

---

### Responsibilities:

#### UI Layer

* Input field for Notion link
* “Generate PDF” button
* Loading state (spinner/progress)
* Error messages (invalid link, failed fetch)

---

#### API Interaction

* Send POST request to backend with Notion URL
* Handle response:

  * Success → trigger download
  * Error → show message

---

#### UX Logic

* Disable button during processing
* Basic validation before API call

---

# 3. 🧠 Backend Responsibilities

### 🎯 Tech Stack:

* Node.js + Express (or Fastify)
* PDF library: **Puppeteer** (HTML → PDF)

---

### Core Modules:

---

## 3.1 Input Handler

* Accept Notion URL
* Validate format
* Reject invalid inputs

---

## 3.2 Content Fetcher

**Options:**

* MVP: Fetch public Notion page HTML (via HTTP request)
* Parse DOM

---

## 3.3 Content Parser

* Extract:

  * Headings
  * Paragraphs
  * Lists
  * Images

* Convert to structured JSON:

```json
[
  { "type": "heading", "level": 1, "text": "Title" },
  { "type": "paragraph", "text": "Content" }
]
```

---

## 3.4 Formatter

* Convert structured JSON → clean HTML template
* Apply:

  * Typography
  * Spacing
  * Layout

---

## 3.5 PDF Generator

* Use Puppeteer:

  * Load HTML
  * Generate PDF (A4)

---

## 3.6 Response Handler

* Return PDF as:

  * File stream OR
  * Temporary download URL

---

# 4. 🗄 Database Schema Proposal

### 🎯 MVP Decision:

❌ No database required

---

### Optional (if needed later):

#### Table: `conversions`

| Field      | Type      | Description      |
| ---------- | --------- | ---------------- |
| id         | string    | unique id        |
| url        | text      | Notion link      |
| status     | string    | success / failed |
| created_at | timestamp |                  |

👉 Use only if analytics/logging needed

---

# 5. 🔌 API Structure

---

## POST `/generate-pdf`

### Request:

```json
{
  "url": "https://notion.so/..."
}
```

---

### Success Response:

* Content-Type: application/pdf
* Returns PDF file stream

---

### Error Response:

```json
{
  "error": "Invalid link or unable to fetch content"
}
```

---

## Health Check (optional)

### GET `/health`

```json
{ "status": "ok" }
```

---

# 6. 🔐 Authentication Strategy

### MVP:

❌ No authentication

---

### Reason:

* Reduces friction
* Faster launch
* No user data handling

---

### Future:

* Add API key / rate limiting
* Optional user accounts

---

# 7. 🔗 Third-Party Dependencies

---

## Core Dependencies

* **Puppeteer** → PDF generation
* **Axios / Fetch** → HTTP requests
* **Cheerio** → HTML parsing

---

## Optional Infra

* **Vercel / Netlify** → Frontend hosting
* **Render / Railway** → Backend hosting

---

## Notion Access

* MVP: Public page scraping
* Future: Official Notion API

---

# 8. 📈 Scalability Considerations

---

## 🚀 Short-Term (MVP)

* Single server instance
* Synchronous processing
* Limit request size
* Basic rate limiting (IP-based)

---

## ⚠️ Bottlenecks

* Puppeteer is resource-heavy
* Large documents slow processing

---

## 📊 Mid-Term Improvements

* Queue system (BullMQ + Redis)
* Background PDF jobs
* Caching repeated requests
* CDN for file delivery

---

## 🧠 Long-Term Scaling

* Microservice split:

  * API service
  * PDF worker service

* Horizontal scaling (multiple workers)

* Use serverless PDF generation if needed

---

# 🧠 Key Engineering Decisions

---

### ✅ Keep:

* Simple synchronous flow
* No database
* One endpoint

---

### ❌ Avoid:

* Microservices (too early)
* Complex infra
* User system

---

# ⚡ Build Plan (Execution Order)

1. Frontend UI (input + button + loading)
2. Backend endpoint `/generate-pdf`
3. Notion page fetch + parsing
4. HTML formatter
5. Puppeteer PDF generation
6. Connect frontend ↔ backend
7. Error handling

---

# 🧩 Final System Summary

> A lightweight pipeline:
> **URL → Fetch → Parse → Format → PDF → Download**

---
