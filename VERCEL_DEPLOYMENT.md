# Deploying Salary Portal to Vercel

This repository contains two independently deployed applications:

- `frontend`: the Next.js web application
- `backend`: the Hono API and Prisma/PostgreSQL integration

Deploy them as **two Vercel projects from the same Git repository**. Do not upload `.env` or `.env.local` files to GitHub.

## 1. Prepare production values

Keep the existing production PostgreSQL/Neon connection string ready. Create a new long, random value for `AUTH_JWT_SECRET`; do not reuse a development secret.

The Cloudinary values already used by the frontend are public upload configuration values:

```text
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
```

## 2. Deploy the backend project first

In Vercel, choose **Add New > Project**, select this Git repository, then use these settings:

| Setting | Value |
| --- | --- |
| Project name | `salary-portal-api` |
| Root Directory | `backend` |
| Framework Preset | Other |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm vercel-build` |

Add these Production environment variables before deploying:

```text
DATABASE_URL=<production PostgreSQL connection string>
AUTH_JWT_SECRET=<new long random secret>
NODE_ENV=production
FRONTEND_URL=https://your-frontend-project.vercel.app
```

`FRONTEND_URL` can be set after the frontend project is created. If you use a custom frontend domain later, replace it with that exact HTTPS origin. Multiple allowed origins can be comma-separated.

The backend is configured with `api/[...route].ts`; after deployment, verify:

```text
https://your-api-project.vercel.app/api/health
```

It should return `{ "status": "ok" }`.

## 3. Apply Prisma migrations once

From your own machine, with the production `DATABASE_URL` available to the backend environment, run:

```bash
cd backend
corepack pnpm prisma migrate deploy
corepack pnpm prisma generate
```

Run `migrate deploy` only when the repository contains a new migration. Do not use `prisma migrate dev` against production.

## 4. Deploy the frontend project

Import the same repository again as a separate Vercel project:

| Setting | Value |
| --- | --- |
| Project name | `salary-portal-web` |
| Root Directory | `frontend` |
| Framework Preset | Next.js |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm build` |

Add these Production environment variables:

```text
NEXT_PUBLIC_API_URL=https://your-api-project.vercel.app
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<existing Cloudinary cloud name>
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<existing Cloudinary upload preset>
```

Do not add a trailing slash to `NEXT_PUBLIC_API_URL`.

After the frontend is deployed, copy its deployment URL into the backend project's `FRONTEND_URL` variable, redeploy the backend, then redeploy the frontend once more. This ensures browser cookies and CORS work in production.

## 5. Production verification

1. Open the frontend URL in an incognito window.
2. Log in with an existing account.
3. Refresh once; the authenticated session should remain active.
4. Test a read and create action (for example leave request or attendance).
5. Confirm uploaded Cloudinary files open correctly.
6. Open the Vercel Function logs if any API call fails.

## Preview deployments

The configured production CORS origin is intentionally strict. Preview frontend URLs are not automatically allowed. To test previews, temporarily add that preview URL to `FRONTEND_URL` as a comma-separated additional origin, then redeploy the API.
