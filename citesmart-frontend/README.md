# CiteSmart Frontend

React + TypeScript frontend for the CiteSmart citation management tool.

## Prerequisites

- **Node.js** ≥ 18
- **Backend** running at `http://127.0.0.1:8000` (see `citesmart-backend/`)

## Getting started

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
