# PDF Chatter — Frontend

React + Tailwind CSS client for a PDF question-answering app. Upload PDFs, track processing, and chat with your documents. Every answer shows the source document and page.

Backend: [pdf-chatter-backend](https://github.com/aniWakalkar/pdf-chatter-backend)

## Features
- Register, login and protected routes
- Dashboard with document and conversation stats
- Drag-and-drop PDF upload with progress and validation
- Live processing status: Uploaded → Extracting → Indexing → Ready / Failed, with retry
- Chat with document selection, conversation history and follow-up questions
- Clickable citations that open the PDF at the cited page, plus source excerpts
- Responsive layout with loading, empty and error states

## Tech stack
React 19 · React Router 7 · Tailwind CSS 4 · Vite 7 · lucide-react

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173.

## Environment variables

| Variable | Example | Meaning |
|---|---|---|
| VITE_API_BASE_URL | http://localhost:8000 | Backend gateway URL. Leave empty to use the Vite dev proxy |
| VITE_MAX_UPLOAD_MB | 20 | Client-side upload limit, should match the backend |

## Project structure

```
src/
  components/   layout, route guards, upload dropzone, message bubble, badges
  context/      auth state
  hooks/        documents polling
  pages/        login, register, dashboard, documents, chat
  services/     API client
  utils/        formatting helpers
```

## Deployment (Render static site)
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment: `VITE_API_BASE_URL=https://<your-backend>.onrender.com`
- Rewrite rule: source `/*`, destination `/index.html`, action `Rewrite` (needed for client-side routes)

Add the deployed frontend URL to the backend's `ALLOWED_ORIGINS` (comma-separated, multiple origins supported).
