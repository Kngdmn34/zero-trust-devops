# Tasks — Frontend (Next.js + TypeScript)

A Notion-inspired TODO web app with AI task breakdown powered by the **Groq**
API. Built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS.

The Groq API key is used **server-side only** (`src/lib/groq.ts` →
`src/app/api/ai/route.ts`), so the key is never sent to the browser. The AI
"breakdown" button calls `POST /api/ai` which calls Groq and returns subtasks.

## Directory & port

- **Directory:** `frontend/` (root of the monorepo)
- **Dev port:** 3000 (`next dev`)
- **Prod port:** 3000 by default (override with `PORT`)

## Build commands

All commands run from the `frontend/` directory.

```bash
# 1. Install dependencies (use npm ci in CI for reproducible installs)
npm install        # local dev
npm ci             # CI/CD

# 2. Lint (optional, non-blocking)
npm run lint

# 3. Production build
npm run build      # runs: next build

# 4. Run the production server (after build)
npm run start       # runs: next start  (listens on $PORT, default 3000)

# Local development
npm run dev         # runs: next dev (hot reload, http://localhost:3000)
```

### CI/CD (minimal)

```bash
cd frontend
npm ci
npm run build
# Deploy: copy the .next standalone output / run `next start` with the env vars below.
```

## Production environment variables

| Variable | Required | Scope | Description |
|---|---|---|---|
| `GROQ_API_KEY` | **Yes** | server | Groq API key for AI features. Secret — kept on the server, never exposed to the client. |
| `GROQ_MODEL` | No | server | Groq model ID. Default `openai/gpt-oss-20b`. See https://console.groq.com/docs/models |
| `NEXT_PUBLIC_API_URL` | No | public | Backend API base URL (e.g. `https://api.example.com`). When set, the UI syncs with the backend; when empty it runs in local demo mode. |
| `NODE_ENV` | Yes | both | Set to `production` for production builds/runs. |
| `PORT` | No | server | Port for `next start`. Default `3000`. |

> Only `GROQ_API_KEY` is strictly required for the AI feature to work at
> runtime. The build itself does **not** require the key — it is read at
> request time by the server route handler.

## Local setup

```bash
cd frontend
cp .env.example .env.local   # then fill in GROQ_API_KEY
npm install
npm run dev                  # http://localhost:3000
```

## Notes for the team

- **Infra / CI-CD:** the build is `npm ci && npm run build` inside `frontend/`.
  Inject `GROQ_API_KEY` (and optionally `GROQ_MODEL`, `NEXT_PUBLIC_API_URL`,
  `NODE_ENV=production`, `PORT`) at runtime. The key is not needed at build time.
- **Backend:** when ready, set `NEXT_PUBLIC_API_URL` to the API base URL. The
  REST client in `src/lib/api.ts` expects `GET/POST /todos`, `PATCH/DELETE
  /todos/:id` returning the `Todo` shape in `src/lib/types.ts`.
