# Preproute — Test Management App

A 5-page test management application built for the Preproute Frontend Developer
task: log in, view all tests on a dashboard, create/edit a test's details,
add MCQ questions, and preview & publish.

## Tech stack

- **React + TypeScript** via Vite
- **Tailwind CSS v4** for styling
- **React Router** for the 5 routes
- **TanStack Query** for server state (fetching/caching/mutations)
- **Zustand** (`persist` middleware) for auth/session state
- **React Hook Form + Zod** for form state and validation
- **Axios** for API calls, with a request interceptor that attaches the JWT
  and a response interceptor that logs the user out on `401`

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Test credentials:

```
User ID: vedant-admin
Password: vedant123
```

## API base URL and CORS

`VITE_API_BASE_URL` is set to `/api` (see `.env`) — the frontend never calls
the staging backend cross-origin. Instead:

- **Dev**: `vite.config.ts` proxies `/api/*` to
  `https://admin-moderator-backend-staging.up.railway.app` (see `server.proxy`).
- **Prod**: `vercel.json` (Vercel rewrites) and `public/_redirects` (Netlify
  redirects) do the same same-origin rewrite for the deployed build.

This was necessary because the staging API does not send
`Access-Control-Allow-Origin` headers, so direct browser calls from any
origin other than the API's own are blocked by CORS. Routing everything
through a same-origin rewrite sidesteps that without needing changes on the
backend.

## Notable technical decisions

- **`GET /tests/:id` returns resolved names, not ids.** The API denormalizes
  `subject`/`topics`/`sub_topics` to display strings on read, but `POST /tests`
  expects subject/topic **ids**. The Add Questions page needs a topic-by-subject
  lookup, so it resolves the test's subject name back to an id via `GET /subjects`
  before querying topics.
- **`status` is a required enum**, not the nullable field shown in the task
  doc's example payload. Valid values are `draft`, `live`, `scheduled`,
  `unpublished`, `expired`. The app always sends `draft` on create/save and
  `live` or `scheduled` on publish.
- **Bulk question creation requires a `subject` string per question** (not
  documented in the task brief). The app fills it in from the parent test's
  subject at submit time rather than per-question, since it's constant for a
  given test.
- **Total Marks is derived, not entered.** It's computed as
  `correct_marks × total_questions` and shown as a disabled field, matching
  the greyed-out treatment in the Figma design.
- **No rich-text editor for question text.** The Figma shows a formatting
  toolbar; given the scope, question/solution text is a plain textarea. A
  real rich-text editor would be a reasonable follow-up.
- **`/tests` can be slow** on the shared staging instance (observed
  10–45s for the full list). No client-side timeout is set on the Axios
  instance so slow-but-successful responses aren't aborted; the dashboard
  shows a loading state while it waits.

## Project structure

```
src/
  api/            # axios instance + one module per resource
  components/
    ui/           # Button, Input, Select, MultiSelect, RadioGroup, etc.
    layout/       # AppShell (sidebar + topbar)
  hooks/          # TanStack Query hooks for subjects/topics/sub-topics
  pages/          # one component per route
  routes/         # ProtectedRoute
  store/          # Zustand auth store
  types/          # shared API/domain types
```
