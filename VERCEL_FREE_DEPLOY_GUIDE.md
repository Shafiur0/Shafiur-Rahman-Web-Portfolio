# Deploy This Project on Vercel (Free Plan)

This guide shows the exact steps to deploy your project to Vercel free plan.

It is written for your current structure where app code is in the `web` folder.

---

## 1. Prerequisites

Before you start, make sure you have:

1. A GitHub account
2. A Vercel account (free)
3. Node.js 20+ installed locally
4. Your project pushed to a GitHub repository

If your repository root is `SRdev` and the app is inside `web`, that is fine. You will set the Root Directory in Vercel.

---

## 2. Prepare Project for Production

From local terminal:

```powershell
cd D:\SRdev\web
npm install
npm run build
```

You must fix build errors before deploying.

If you still see top-level await build errors, fix them first in:

- `__create/route-builder.ts`
- `__create/index.ts`

Then run `npm run build` again until it succeeds.

---

## 3. Create Safe Environment File Locally

Your local `.env` should contain real secrets.

Your `.env.example` should contain placeholders only (no real tokens).

Important:

1. Never commit real secrets.
2. If a real token was exposed, rotate it now.

---

## 4. Push Code to GitHub

From `D:\SRdev\web`:

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add .
& 'C:\Program Files\Git\cmd\git.exe' commit -m "Prepare for Vercel deploy"
& 'C:\Program Files\Git\cmd\git.exe' push origin main
```

If your branch is not `main`, push your actual branch.

---

## 5. Import Project in Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repo
4. Configure project:

- Framework Preset: `Other` (or `React Router` if Vercel auto-detects it)
- Root Directory: `web` (important for your repo layout)
- Build Command: `npm run build`
- Install Command: `npm install`

5. Do not click Deploy yet. First add environment variables.

---

## 6. Add Environment Variables in Vercel

In Vercel project setup (or Project Settings -> Environment Variables), add these values.

### Required variables

1. `ANYTHING_PROJECT_TOKEN`
2. `DATABASE_URL`
3. `AUTH_SECRET`
4. `AUTH_URL`
5. `NEXT_PUBLIC_CREATE_ENV`
6. `NEXT_PUBLIC_CREATE_BASE_URL`
7. `NEXT_PUBLIC_CREATE_HOST`
8. `NEXT_PUBLIC_PROJECT_GROUP_ID`

### Optional but recommended

1. `CORS_ORIGINS`
2. `NEXT_PUBLIC_CREATE_API_BASE_URL`

### Optional social auth variables (only if using those providers)

1. `GOOGLE_CLIENT_ID`
2. `GOOGLE_CLIENT_SECRET`
3. `FACEBOOK_CLIENT_ID`
4. `FACEBOOK_CLIENT_SECRET`
5. `TWITTER_CLIENT_ID`
6. `TWITTER_CLIENT_SECRET`
7. `APPLE_CLIENT_ID`
8. `APPLE_CLIENT_SECRET`

### Example production values

- `AUTH_URL=https://your-project-name.vercel.app`
- `NEXT_PUBLIC_CREATE_ENV=PRODUCTION`
- `CORS_ORIGINS=https://your-project-name.vercel.app`

Generate a strong `AUTH_SECRET` with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 7. Deploy

After environment variables are set:

1. Click `Deploy`
2. Wait for build to finish
3. Open deployment URL

If deployment fails, check:

1. Build logs (first error is the real one)
2. Missing environment variables
3. Wrong Root Directory (must be `web`)

---

## 8. Post-Deploy Validation Checklist

Open your deployed URL and verify:

1. Home page loads
2. API routes work (`/api/portfolio/profile`, etc.)
3. Auth flow works
4. Admin page works only as intended
5. File upload works
6. Database reads and writes succeed

Then check Vercel logs:

1. Go to Project -> Deployments -> latest deployment
2. Open Functions and Runtime logs
3. Confirm no auth/db runtime errors

---

## 9. Redeploy Workflow (Daily Use)

After first setup, normal workflow is:

1. Commit changes
2. Push to GitHub
3. Vercel auto-deploys from your branch

You only need to revisit Vercel settings when:

1. You add/change environment variables
2. You change build/install commands
3. You change root folder layout

---

## 10. Free Plan Limits to Keep in Mind

Vercel free plan is good for portfolio and small projects, but note:

1. Limited build minutes
2. Limited function execution quotas
3. Cold starts possible on server functions
4. Team/commercial production usage has policy limits

Keep logs and usage monitored in Vercel dashboard.

---

## 11. Optional: Deploy via Vercel CLI

If you prefer terminal deployment:

```powershell
cd D:\SRdev\web
npm i -g vercel
vercel login
vercel
```

For production deploy:

```powershell
vercel --prod
```

Still set all environment variables in Vercel project settings.

---

## 12. Quick Troubleshooting

### Build fails with top-level await

Refactor module-level `await` into async startup logic in server files, then rebuild.

### Auth returns Unauthorized in production

Check:

1. `AUTH_SECRET` exists
2. `AUTH_URL` matches your real Vercel domain
3. Cookies/security settings are correct for your domain

### API fails with database error

Check:

1. `DATABASE_URL` is correct
2. Database allows connections from Vercel
3. No typo in env var names

---

If you want, create a second file next with a "copy-paste deployment checklist" (very short version) for future deploys in 2 minutes.
