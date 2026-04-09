# Deployment Guide: The Food Tribunal (Unified Vercel)

This guide outlines how to deploy the unified monorepo for "The Food Tribunal" and its "VERDICT" engine using only GitHub, Supabase, and Vercel.

## 🏛️ Final Monorepo Structure
```text
/
├── api/
│   └── index.js           # Vercel Serverless Bridge (Express)
├── server/                # Original Express Backend Source
├── src/                   # Next.js Frontend Source (moved to root)
├── public/                # Static assets
├── vercel.json            # Deployment & Routing configuration
├── package.json           # Unified dependencies
└── schema.sql             # Supabase Database schema
```

## 🚀 Deployment Steps

### 1. Database Setup (Supabase)
1. Log in to your [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor**.
3. Create a new query and paste the contents of `schema.sql`.
4. Run the query to initialize all tables, indices, and relationships.

### 2. Connect to GitHub
1. Create a new repository on GitHub.
2. Initialize your local project and push to the new repository:
   ```bash
   git init
   git add .
   git commit -m "Initialize unified deployment"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

### 3. Vercel Deployment
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. Vercel will auto-detect "Next.js". **Leave all build settings as default.**
5. Open the **Environment Variables** section and add the required variables (see below).
6. Click **Deploy**.

## 🔐 Required Environment Variables
Add these in the Vercel Dashboard Settings:

| Variable | Value |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `/api` |
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_ANON_KEY` | Your Supabase Anon Key |
| `DATABASE_URL` | Your Supabase Connection String (Transaction mode) |
| `OPENAI_API_KEY` | Your OpenAI API Key |
| `JWT_SECRET` | A secure random string for user sessions |
| `NODE_ENV` | `production` |

## ⚠️ Risks & Optimizations (Vercel Hobby Plan)

### 1. Execution Timeout (10s)
The Hobby plan has a strict 10s cutoff. AI-powered "VERDICT" scans are the primary risk. 
- **Optimization**: We have reduced prompt sizes and added `max_tokens` limits.
- **Resilience**: If a timeout occurs, the frontend will retry or the system will fallback to the rule-based engine.

### 2. Initial Cold Starts
Serverless functions might experience a "Cold Start" (delay) after inactivity. 
- **User Impact**: The first scan of the day might take 2-3 seconds longer.

### 3. Analysis Caching
The backend is configured to check if a product has been analyzed before invoking the AI.
- **Benefit**: Common products will load instantly without triggering the 10s timeout risk.

---
> [!TIP]
> **Authority Check**: Once deployed, visit your domain (e.g., `thefoodtribunal.vercel.app/api/health`) to confirm the VERDICT Engine is operational.
