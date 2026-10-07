# CiteSmart Frontend

React + TypeScript frontend for the CiteSmart citation management tool.

## Prerequisites

- **Node.js** ≥ 18
- **Backend** running at `http://127.0.0.1:8000` (see `citesmart-backend/`)

## Getting started

Configure the Google OAuth client ID before starting the app:

```bash
cd citesmart-frontend && cp .env.example .env.local
```

Set `VITE_GOOGLE_CLIENT_ID` in `.env.local`. This is a public OAuth client
identifier that is included in the browser bundle, not a secret; keep it out of
Git and restrict its authorized origins in Google Cloud Console.

For deployment, configure the same client ID separately in both services:

- **Vercel (frontend):** Set `VITE_GOOGLE_CLIENT_ID` in the project's
  Environment Variables for the environments you deploy (Production, Preview,
  and/or Development), then redeploy. Vite embeds this value at build time, so
  changing the variable does not update an already-built deployment.
- **Render (backend):** Set `GOOGLE_CLIENT_ID` in the backend service's
  Environment settings. Also ensure its latest deploy installs the dependencies
  from `citesmart-backend/requirements.txt`.

The variable names are intentionally different: Vite only exposes frontend
variables prefixed with `VITE_`. If Google's sign-in UI reports a missing
client ID, check the Vercel setting and redeploy; if the backend logs an import
error for `google.auth.transport.requests`, redeploy with the updated backend
requirements.

```bash
cd citesmart-frontend
npm install
npm run dev
```

The dev server starts on **http://localhost:5173**.

All API calls (`/auth`, `/bibliographies`, `/citations`, `/search`, `/export`) are proxied to the backend via Vite's built-in proxy — no CORS setup needed.

## Stack

| Layer     | Choice                     |
| --------- | -------------------------- |
| Framework | React 19 + TypeScript      |
| Bundler   | Vite                       |
| Routing   | React Router v7            |
| HTTP      | Axios                      |
| Styling   | Tailwind CSS v4            |

## Project structure

```
src/
  api/
    client.ts          # Axios instance + JWT interceptors
    endpoints.ts       # Typed functions for every backend route
  context/
    AuthContext.tsx     # Auth state (token, user, login/logout)
    ToastContext.tsx    # Toast notification system
  components/
    ProtectedRoute.tsx  # Redirects to /login if not authenticated
    Header.tsx          # Sticky top nav with branding + logout
    Modal.tsx           # Reusable modal overlay
    SearchPane.tsx      # Left pane: search + results
    BibliographyPane.tsx# Right pane: citations + export
    ResultCard.tsx      # Individual search result card
    CitationCard.tsx    # Individual saved citation card
  pages/
    Landing.tsx         # Public landing page
    Signup.tsx          # Sign-up form
    Login.tsx           # Log-in form
    Dashboard.tsx       # Bibliography list + create/delete
    Workspace.tsx       # Two-pane search + bibliography view
  utils/
    formatters.ts       # Client-side APA/MLA/Chicago/BibTeX formatting
  types.ts              # Shared TypeScript interfaces
  App.tsx               # Router + providers
  main.tsx              # Entry point
  index.css             # Tailwind imports + custom animations
```
