---
name: build-notion2pdf
description: Use when building, running, refactoring, or bug-fixing the Notion2Pdf MVP web app. Imposes strict PRD, TRD, and Design capabilities.
disable-model-invocation: true
---

## What This Skill Does
Orchestrates the complete build, run, and iteration lifecycle for the Notion2Pdf MVP web app using React (Vite+Tailwind) for the frontend and Node.js (Express+Puppeteer) for the backend. Use this to ensure absolute alignment with product specifications and premium design systems whenever interacting with the codebase.

## Product Context (PRD)
- **Primary User:** Students who need to export Notion files cleanly for sharing/printing.
- **UX Principles:** No login, no distractions, single-page experience, <15s response.
- **User Flow:** 
  1. Paste public Notion Link.
  2. Click "Generate PDF".
  3. Wait for loading.
  4. Auto-download PDF file.
- **Scope Limitations:** Ignore Toggles, Embeds, Database tables. Fully ignore user limits, accounts, or auth.

## Architecture & Constraints (TRD)
- **Frontend**: React (Vite) + Tailwind CSS.
- **Backend**: Node.js + Express + `cors` + `axios` + `cheerio` + `puppeteer`. Stateless, single endpoint `/generate-pdf`.
- **MVP Features**: Accepts a public Notion URL, fetches & parses basic content (headings, paragraphs, lists, images), converts to structurally clean HTML via `cheerio`, generates A4 layout via `puppeteer`, and returns it as a downloadable stream.

## Design System: "The Academic Architect" (Stitch/CLAUDE.md)
Implement the frontend strictly with these aesthetic rules (overriding generic Tailwind choices):

1. **Typography**: Use **Inter**.
   - Display/Hero: `3.5rem`, `-0.02em` tracking, tight line-height.
   - Body: `1rem` with `1.6` line-height.
   - Labels: `0.75rem`, color `#5f5f5f`.
2. **Colors**: Monochromatic foundation + authoritative Blue.
   - Base Layer: `surface` `#fcf9f8`
   - Secondary Content Layer: `surface-container-low` `#f6f3f2`
   - Interactive/Floating: `surface-container-lowest` `#ffffff`
   - Primary/Brand: `#0050e1` (text on primary: `#f8f7ff`). For primary CTAs, use a subtle linear gradient from `#0050e1` to `#0046c7` at 145°.
   - **No Black**: Use `#0e0e0e` for high-contrast text.
3. **Depth Rule**: **No 1px solid borders for sectioning**. Define boundaries via background color shifts, or use a ghost border (`#b2b2b1` at 15% opacity) only if strictly needed for accessibility.
4. **Shadows**: Floating states get a custom ambient shadow (40px blur, 4% opacity, derived from `#323233`). Never use flat default Tailwind shadows.
5. **Glassmorphism**: Persistent navigation elements use `#fcf9f8` at 80% opacity with `24px` backdrop-blur.

## Process Workflow
When invoked to build or iterate on the app, follow these steps explicitly:

1. **Scaffold the App**:
   - UI: React + Vite + Tailwind configured in `frontend/`. Custom colors inserted directly into `tailwind.config.js`.
   - API: Express + Puppeteer logic housed in `backend/`.
2. **Implement Backend (`backend/server.js`)**:
   - Extract headings, paragraphs, lists, and images.
   - Format into a clean, minimal HTML template matching "Academic" readability.
   - Use `page.pdf({ format: 'A4', margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } })`.
3. **Implement Frontend (`frontend/src/App.jsx`)**:
   - Single page layout: Asymmetrical balance preferred. Base background is `#fcf9f8`.
   - Add input field (focus state: `#ffffff` bg, 2px border `#0050e1`), and a gradient-styled Primary CTA button.
   - Handle visual state: Idle -> Loading (Spinner/Message) -> Downloading -> Complete.
4. **Quality & Checks**:
   - Do not use generic tailwind classes like `bg-blue-600` or `shadow-md`. Use the defined tokens.
   - Ensure the server runs on port `5000` and UI connects properly over localhost.

## Anti-Patterns to Prevent
- **Do not** add generic glassmorphism cards around text.
- **Do not** use simple `transition-all`. Animate `transform` and `opacity` explicitly.
- **Do not** drift from the PRD to add accounts, tables, or database functionality.
