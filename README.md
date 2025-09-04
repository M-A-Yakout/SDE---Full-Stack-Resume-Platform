# Resume Platform

A modern, AI-powered resume creation and management platform built with Next.js, React, and TypeScript.

This repository contains server-side resume storage (Prisma + MySQL), NextAuth authentication, AI-powered text suggestions (OpenAI), and server-side PDF generation using puppeteer-core + a Chromium helper.

## Features

- Secure Authentication (Email/Password)
- Interactive Resume Builder with versioning
- AI-powered content suggestions and improvements
- Export resumes to PDF (server-side)
- Dashboard to list, view, edit, delete resumes
- Resilient PDF upload: Vercel Blob upload with local fallback to `public/pdfs`

## Tech stack & notable libs

- Next.js (app directory)
- React
- TypeScript
- TailwindCSS
- Prisma (ORM)
- puppeteer-core + @sparticuz/chromium (server-side PDF rendering)
- next-auth (authentication)
- OpenAI API (optional, for AI suggestions)

## Quick setup

1. Install dependencies

```powershell
npm install
```

2. Generate Prisma client

```powershell
npx prisma generate
```

3. Apply database migrations (or push schema for local dev)

```powershell
npx prisma migrate dev --name init
# or, if you want to force reset during development
npx prisma db push --force-reset
```

4. Start the dev server

```powershell
npm run dev
```

Open http://localhost:3000 in your browser.

## Important environment variables

Copy `.env.example` to `.env` and fill in the values. Key variables used by the project:

- DATABASE_URL — your Prisma/MySQL connection string.
- NEXTAUTH_SECRET — random string for NextAuth sessions.
- NEXTAUTH_URL — URL where the app runs (e.g. http://localhost:3000).
- VERCEL_TOKEN — (optional) token used to upload generated PDFs to Vercel Blob storage. If missing or unauthorized, generated PDFs will be saved locally to `public/pdfs/` and served by the app.
- OPENAI_API_KEY — (optional) if provided, the AI suggestion endpoint will call the OpenAI API. Note: quota or rate limits may cause 429 errors.
- CHROME_EXECUTABLE_PATH — (optional) absolute path to a Chromium/Chrome executable on the host. If set, the server will try to use this executable. If unset, the packaged Chromium helper (`@sparticuz/chromium`) will be used as a fallback.

Example Windows Chrome path you might use for `CHROME_EXECUTABLE_PATH`:

```
C:\Program Files\Google\Chrome\Application\chrome.exe
```

Important: `CHROME_EXECUTABLE_PATH` must point to the executable file itself (not a directory). If you point it to a folder, the PDF generation will fail with a spawn ENOENT.

## PDF generation details & troubleshooting

- The server uses `puppeteer-core` and a Chromium helper to render HTML to PDF.
- If `CHROME_EXECUTABLE_PATH` points at a valid chrome/chromium executable, it will be used (faster). Otherwise the helper attempts to locate or extract a compatible Chromium binary.
- If Vercel Blob upload fails (for example if `VERCEL_TOKEN` is missing or forbidden), the code will save the generated PDF under `public/pdfs/<fileId>.pdf` and return a reachable URL so downloads still work.

Common errors and fixes:

- Next.js runtime error: "Route used `params.x`. `params` should be awaited before using its properties." —
  This project uses Next.js server components and API routes that expect you to `await params` in handlers; the codebase has been updated to follow that pattern. If you still see this, ensure you are running the latest code.

- puppeteer spawn ENOENT pointing at a directory — check `CHROME_EXECUTABLE_PATH` in your `.env`. It must be the full path to the executable file (e.g., `...\chrome.exe`).

- Vercel Blob upload returns `forbidden` — verify that `VERCEL_TOKEN` is set and has the correct permissions. If you don't want to use Vercel, leaving this unset uses the local fallback (saved to `public/pdfs`).

- OpenAI 429 / insufficient quota — supply a valid `OPENAI_API_KEY` with available quota or expect the AI endpoint to return 429 errors when quota is exhausted.

## Local testing tips

- Generate a resume in the UI (or create one via API) and click "Save & Download PDF". The UI shows a loader while the server generates the PDF.
- If PDF generation fails due to Chrome, re-check `CHROME_EXECUTABLE_PATH`, or let the packaged Chromium helper extract a copy on first run (ensure the server process can write to the temp directory).
- If Vercel upload fails, look in `public/pdfs/` for the saved file and open it directly in the browser (served statically by Next.js in dev).

## Development notes

- The code uses Prisma JSON fields to store resume sections (personal, education, experience, skills). Editing and viewing flows enforce that only the resume owner can edit/delete.
- Interactive actions (delete, logout) are implemented in small client components to satisfy Next.js server/client boundaries.
- The AI suggestions endpoint is guarded: it validates inputs and will surface OpenAI errors (including quota 429s). Consider adding a local rewrite fallback if you need offline behavior.

## Contributing

- Please follow the existing code style and component patterns. Keep server-side data fetching in server components and move event handlers into small client components.
- If you change the PDF generation, ensure the fallback to `public/pdfs/` is preserved for robustness.

## Useful commands

```powershell
# install deps
npm install

# prisma
npx prisma generate
npx prisma migrate dev --name init

# run dev server
npm run dev
```

## License

This project includes code and scaffolding for learning and prototyping. Check individual package licenses for bundled dependencies.


## Screenshot

<img width="2559" height="1387" alt="image" src="https://github.com/user-attachments/assets/bd041371-b937-424f-aa91-b374c1c7c783" />

<img width="2559" height="1371" alt="image" src="https://github.com/user-attachments/assets/c9cac341-1be2-4561-b0ef-6e96a58da60c" />

<img width="2555" height="1378" alt="image" src="https://github.com/user-attachments/assets/2a6bc691-593e-492b-808e-271347277811" />


<img width="2559" height="1377" alt="image" src="https://github.com/user-attachments/assets/60353878-2551-469b-a7c3-a63f65d329b3" />

<img width="2549" height="1363" alt="image" src="https://github.com/user-attachments/assets/f282d37f-59fc-452e-8c1b-d25415df6aff" />

<img width="2559" height="1378" alt="image" src="https://github.com/user-attachments/assets/40de8a3a-0a74-435e-bf6f-3c0b75b02521" />







