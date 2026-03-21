# Deployment Guide

## Stack
- **Frontend** → Vercel
- **Backend** → Render
- **Database** → MongoDB Atlas

---

## 1. MongoDB Atlas (Database)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and whitelist `0.0.0.0/0` (allow all IPs for Render)
3. Copy the connection string — you'll need it as `MONGO_URL`

---

## 2. Backend → Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo, set **Root Directory** to `backend`
4. Render will auto-detect the `render.yaml` config
5. Set these environment variables in Render dashboard:
   - `MONGO_URL` — your Atlas connection string
   - `DB_NAME` — `crm_db` (or your preferred name)
   - `JWT_SECRET` — any long random string
   - `CORS_ORIGINS` — your Vercel frontend URL (set after step 3)
   - Optional: `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, etc.
6. Deploy — note your Render URL (e.g. `https://crm-backend.onrender.com`)

---

## 3. Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
2. Vercel auto-detects `vercel.json` — no framework preset needed
3. Add environment variable:
   - `REACT_APP_BACKEND_URL` = your Render backend URL (no trailing slash)
4. Deploy

---

## 4. Final Step — Update CORS

After Vercel gives you a URL, go back to Render and update:
- `CORS_ORIGINS` = `https://your-app.vercel.app`

Then redeploy the backend.

---

## Environment Variable Reference

See `backend/.env.example` and `frontend/.env.example` for all variables.
