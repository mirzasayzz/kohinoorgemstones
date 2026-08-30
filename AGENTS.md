# AGENTS.md - Kohinoor Gemstone Project Rules

## Git & Commit Rules

- **Author:** All commits must be authored by **Tuba Mirza** (tubamirza23@lpu.in)
- **No Codebuff branding:** Never include "Generated with Codebuff" or "Co-Authored-By: Codebuff" in commit messages
- **Branch policy:** Only `main` branch should exist. Delete other branches after merging
- **Push only to main:** Do not push to feature branches without explicit approval

## Production URLs

- **Frontend:** `https://www.kohinoorgemstone.com`
- **Backend:** Same domain (not separate Vercel, Render, or Heroku)
- **CORS allowed origins:** Only `kohinoorgemstone.com` and `www.kohinoorgemstone.com`
- **Never reference:** Vercel, Render, or Heroku URLs in code or configs

## Project Structure

```
/
├── backend/          # Node.js/Express API (port 3001)
├── frontend/         # React + Vite (port 5173)
├── tests/            # Playwright E2E & API tests
└── .github/workflows # CI pipeline
```

## Development Servers

- **Backend:** `http://localhost:3001`
- **Frontend:** `http://localhost:5173`
- **Tests run against localhost** (CI spins up both servers)

## Required Environment Variables

Backend `.env` must have:
- `NODE_ENV`
- `MONGODB_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY`

## Test Commands

```bash
# Run all tests
cd tests && npm test

# Run only API tests
cd tests && npx playwright test tests/api

# Run only E2E tests
cd tests && npx playwright test tests/e2e

# Lint & typecheck
cd tests && npm run lint && npm run typecheck
```

## Hard Rules

1. Never commit secrets, tokens, or credentials
2. Never force push to main without explicit approval
3. Never remove lines from memory files, only append
4. Verify changes with typecheck and tests before committing
5. Match existing code style and conventions
