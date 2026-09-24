# GoEdu – Easy Deployment Guide (GitHub → Hostinger Node.js + MySQL)

Everything (users, passwords, courses, orders, enrolments, chats) is stored in **MySQL**.
One Node.js process serves both the API (`/api/...`) and the website. Follow the steps in order.

---

## Part A – Fix "This site can't provide a secure connection" (ERR_SSL_PROTOCOL_ERROR)

This error is **not** an application bug. It means the browser asked for `https://goedu.ashiik.com`
but no SSL certificate is active for that (sub)domain yet, or the domain does not point to the app.

1. hPanel → **Websites** → your site → **Security → SSL**.
2. If `goedu.ashiik.com` is not listed, click **Install SSL** (free Let's Encrypt) and choose the subdomain.
   A subdomain needs its own certificate – the certificate of `ashiik.com` does not cover it.
3. Wait 10–30 minutes. Then check **Security → SSL → Force HTTPS** (turn it on).
4. Meanwhile test with `http://goedu.ashiik.com` (no *s*). If HTTP works, only SSL is missing.
   If HTTP also fails, go to **Domains → DNS** and make sure `goedu` has an **A record** pointing to
   your hosting IP (or the CNAME Hostinger created). DNS changes take up to 24 h.
5. If Hostinger shows *"SSL installation failed"*, remove and re-add the subdomain, then install SSL again.

---

## Part B – Put the code on GitHub

```bash
cd C:\Users\DIU\Desktop\goedu
git add .
git commit -m "Deploy GoEdu"
git remote add origin https://github.com/<your-username>/goedu.git   # only the first time
git push -u origin main
```

`backend/.env` is ignored by git – your secrets are never uploaded. They are entered in Hostinger (Part D).

---

## Part C – Create the MySQL database

1. hPanel → **Databases → Management**.
2. **Create new database**: e.g. name `goedu`, user `goedu_user`, a strong password → Create.
3. Write down the 4 values shown: **database name**, **username**, **password**, **host**
   (usually `localhost`; sometimes something like `sql123.main-hosting.eu`).

   Hostinger prefixes names, so they look like `u123456789_goedu` / `u123456789_goedu_user`.

That is all – **the tables and the 281 courses are created automatically the first time the app starts**
(`AUTO_MIGRATE=true`). No terminal needed.

---

## Part D – Create the Node.js app and connect GitHub

1. hPanel → **Websites → Add website → Node.js app** (or open your existing app → *Deployments*).
2. Choose **Deploy from GitHub**, connect your GitHub account, pick the `goedu` repository, branch `main`.
3. App settings:

   | Setting | Value |
   | --- | --- |
   | Node version | 18 or 20 |
   | Root / project directory | `/` (repository root) |
   | Install command | `npm install` |
   | Build command | `npm run build` |
   | Start command | `npm start` |
   | Entry file (if asked) | `backend/src/server.js` |

   `npm install` automatically installs the frontend + backend and builds the website
   (see `postinstall` in `package.json`), so the app also works if the build command is left empty.

4. **Environment variables** (hPanel → Node.js app → *Environment variables* / *.env*):

   | Key | Value |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `APP_URL` | *(leave empty – detected automatically)* or `https://goedu.ashiik.com` |
   | `DB_HOST` | host from Part C |
   | `DB_PORT` | `3306` |
   | `DB_USER` | username from Part C |
   | `DB_PASSWORD` | password from Part C |
   | `DB_NAME` | database name from Part C |
   | `JWT_SECRET` | any long random text (e.g. 40 characters) |
   | `GROQ_API_KEY` | your key from https://console.groq.com/ |
   | `GROQ_MODEL` | `openai/gpt-oss-120b` |
   | `CHAT_LIMIT` | `10` |
   | `CHAT_WINDOW_MINUTES` | `30` |
   | `AUTO_MIGRATE` | `true` |
   | `SEED_DEMO_USER` | `false` |
   | `SSLCOMMERZ_STORE_ID` | *(see Part F – leave empty at first)* |
   | `SSLCOMMERZ_STORE_PASSWORD` | *(leave empty at first)* |
   | `SSLCOMMERZ_SANDBOX` | `true` |

   Do **not** set `PORT` – Hostinger provides it.

   > **Important:** the file `backend/.env` on your PC is **never uploaded** (it is git-ignored),
   > so values written there do not reach the server. Enter them in the Hostinger panel as above.
   >
   > **Option B (if the panel has no environment-variable section):** copy `backend/.env` to
   > `backend/.env.production`, put the Hostinger database values in it, then `git add` + `git push`.
   > That file is read automatically on the server. Only do this if the GitHub repository is **private**.

5. Click **Deploy**. Watch the deployment log: you should see
   `[db] connected to MySQL ...`, `[migrate] database ... is ready`, `[seed] done.` and
   `[server] GoEdu listening ...`.
6. Turn on **Auto-deploy**: every `git push` to `main` updates the live site.

---

## Part E – Check that everything works

| Check | How |
| --- | --- |
| API alive | open `https://goedu.ashiik.com/api/health` → `{"success":true,"database":"ok"}` |
| Courses loaded | home page shows courses and instructors |
| Accounts in MySQL | Sign up with a new email, log out, log in again |
| Purchases | add a course to the cart → Checkout → order appears in *Dashboard → Purchases* and the course in *My Learning* |
| Subscription | Subscription page → Get Yearly Access → dashboard shows *Learner Plus* |
| AI Mentor | chat bubble bottom-right → ask for a course → answer with links; badge shows "9/10 messages left" |
| Mentorship | Book a session → appears in *Dashboard → Mentor Sessions* |

To look at the data: hPanel → **Databases → phpMyAdmin** → tables `users`, `orders`, `enrollments`, `chat_messages`, ...

---

## Part F – Real online payments (SSLCommerz)

Until a merchant account is connected, checkout works in **direct mode**: the order is stored in MySQL
and the learner is enrolled immediately (good for launching and testing).

To take real card / bKash / Nagad payments:

1. Register at https://sslcommerz.com (they approve Bangladeshi businesses; sandbox is instant at
   https://developer.sslcommerz.com/registration/).
2. In Hostinger env vars set `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD` and
   `SSLCOMMERZ_SANDBOX=true` (test) → redeploy → make a test purchase (test cards are shown on the sandbox page).
3. When SSLCommerz approves your live store, put the live credentials and set `SSLCOMMERZ_SANDBOX=false`.
4. In the SSLCommerz merchant panel set the IPN URL to `https://goedu.ashiik.com/api/v1/payments/sslcommerz/ipn`.

Flow: Checkout → order saved as *pending* → customer pays on the SSLCommerz page → SSLCommerz calls the site
back → the server validates the payment → order becomes *paid* and the courses are unlocked.

---

## Part G – Updating the site later

```bash
git add .
git commit -m "describe the change"
git push
```

Hostinger redeploys automatically. Database data is never deleted by a redeploy
(the seed only runs when the `courses` table is empty).

---

## Troubleshooting

**Site opens but shows no courses / "Something went wrong"** → open `https://yourdomain.com/api/health`.
If it says `"database": "error: Access denied for user 'root'@..."` the database variables from Part D
are not applied: the app is using the defaults (`root`, no password). Add `DB_HOST`, `DB_USER`,
`DB_PASSWORD`, `DB_NAME` in hPanel → Node.js app → *Environment variables* (the `hint` field in the
health response lists exactly which ones are missing), save, then **Restart / Redeploy** the app.
As soon as the connection works the app creates the tables and loads all courses by itself.

If the panel has no environment variable section, create a file named `.env` in the repository root
(same folder as `package.json`) with the same `KEY=value` lines and push it (remember it contains secrets,
so keep the repository private).

| Problem | Fix |
| --- | --- |
| Courses missing / API returns "Something went wrong" | database variables not set – see above |
| `ERR_SSL_PROTOCOL_ERROR` | Part A – install SSL for the subdomain, wait, force HTTPS |
| Page shows "GoEdu API is running – build the frontend" | build did not run: set Build command `npm run build` and redeploy |
| `[db] setup failed: Access denied` | wrong `DB_USER` / `DB_PASSWORD`, or the user is not assigned to the database in hPanel |
| `Unknown database` | `DB_NAME` typo (remember the `u123456789_` prefix) |
| Login works but cart/checkout says *Please login* | `NODE_ENV` must be `production` **and** the site must be on HTTPS (auth cookie is secure) |
| AI Mentor says "busy" | Groq free tier limit (8k tokens/minute) – wait a minute, or upgrade the Groq plan |
| Images missing | make sure `frontend/public/uploads` was pushed to GitHub (it is part of the repo) |

## Running on your own PC (optional)

```bash
npm run install:all
copy backend\.env.example backend\.env      # fill DB_* (local MySQL) and GROQ_API_KEY
npm run dev                                 # http://localhost:5173
```
