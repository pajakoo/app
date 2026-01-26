# Kbiz Price Hunter

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-NETLIFY-SITE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-NETLIFY-SITE-NAME/deploys)

A simplified, SEO-friendly price tracker built with Next.js, Postgres, and Prisma.
Public product pages are crawlable for search bots, while the dashboard stays
private behind magic-link auth (to be wired next).

## What is included
- Next.js App Router with static product pages.
- `sitemap.xml` + `robots.txt` for indexing.
- Prisma schema for products, stores, prices, and shopping lists.
- Magic-link login screen placeholder.

## Getting started
```bash
npm install
cp .env.example .env
npm run dev
```

## Next steps
- Set up Postgres and run `npx prisma migrate dev`.
- Implement magic-link auth (email provider + token validation).
- Replace demo products with live data ingestion.

## Netlify deploy
1) Push this repo to GitHub.
2) Create a new site in Netlify from the repo.
3) Add env vars in Netlify: `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`.
4) Build command: `npm run build` (already in `netlify.toml`).
5) Deploy. Netlify will use `@netlify/plugin-nextjs` for SSR.

## Deployment checklist
- Update the Netlify badge with your site ID + name.
- Set `NEXT_PUBLIC_SITE_URL` to your production domain.
- Ensure Postgres is reachable from the Netlify environment.
