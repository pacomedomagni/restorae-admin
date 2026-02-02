# Restorae Admin (Next.js)

## Local development

1. Create env:
   - Copy `.env.example` → `.env.local`
2. Install + run:
   - `npm ci`
   - `npm run dev` (defaults to port `3002`)

## Production notes

- Do not bake secrets into the image; pass `NEXTAUTH_*` via runtime environment variables.
- Build + run:
  - `npm run build`
  - `npm run start`
