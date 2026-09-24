# Deploying GoEdu to Hostinger (Node.js + MySQL + GitHub)

This guide covers Hostinger's **Node.js web hosting** (hPanel → Websites → *Node.js*) as well as a
**VPS**. The app is a single Node.js process: Express serves the API under `/api` and the built React
frontend from `frontend/dist`.

---

## 1. Push the project to GitHub

```bash
cd goedu
git init
git add .
git commit -m "GoEdu LMS - initial release"
git branch -M main
git remote add origin https://github.com/<your-user>/goedu.git
git push -u origin main
```

`backend/.env` is git-ignored – secrets are configured on the server (step 3).

## 2. Create the MySQL database (hPanel)

1. hPanel → **Databases → Management** → *Create new database*.
2. Note the values: database name (e.g. `u123456_goedu`), user, password and host
   (usually `localhost`, sometimes `sqlXXX.main-hosting.eu`).
3. (Optional) allow remote access under *Remote MySQL* if you want to seed from your PC.

## 3. Create the Node.js app (Hostinger Node.js hosting)

1. hPanel → **Websites → Add website → Node.js** (or *Deploy from Git*).
2. Connect the GitHub repository and choose the `main` branch.
3. Settings:
   - **Node version:** 18 or 20
   - **Build command:** `npm run build`
   - **Start command / entry file:** `npm start`  (entry: `backend/src/server.js`)
   - **Root directory:** `/` (repository root)
4. **Environment variables** (hPanel → Node.js app → Environment):

   | Key | Value |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `APP_URL` | `https://yourdomain.com` |
   | `CORS_ORIGINS` | `https://yourdomain.com,https://www.yourdomain.com` |
   | `DB_HOST` | from step 2 |
   | `DB_PORT` | `3306` |
   | `DB_USER` | from step 2 |
   | `DB_PASSWORD` | from step 2 |
   | `DB_NAME` | from step 2 |
   | `JWT_SECRET` | a long random string |
   | `GROQ_API_KEY` | your key from https://console.groq.com/ |
   | `GROQ_MODEL` | `openai/gpt-oss-120b` |
   | `CHAT_LIMIT` | `10` |
   | `CHAT_WINDOW_MINUTES` | `30` |

   Hostinger sets `PORT` automatically – the server reads it from `process.env.PORT`.

5. Deploy. Every push to `main` re-deploys automatically when auto-deploy is enabled.

## 4. Create the tables and load the seed data

Run once (from the hPanel terminal / SSH, inside the project folder, after the first deploy):

```bash
npm run db:setup --prefix backend
```

This creates all tables (`backend/database/schema.sql`) and inserts the catalogue
(281 courses, categories, instructors, bundles, blog articles, pages, subscription plans)
plus the demo learner `demo@goedu.ac / Demo@1234`.

If SSH is not available, run it from your PC against the remote database after enabling
*Remote MySQL* in hPanel (set `DB_HOST` to the remote host in a local `backend/.env`).

## 5. Point the domain

Attach your domain to the Node.js app in hPanel and enable the free SSL certificate.
Update `APP_URL` / `CORS_ORIGINS` to the final https URL and redeploy.

---

## VPS alternative (Ubuntu + PM2 + Nginx)

```bash
sudo apt update && sudo apt install -y nodejs npm mysql-server nginx git
sudo npm i -g pm2
git clone https://github.com/<your-user>/goedu.git && cd goedu
cp backend/.env.example backend/.env && nano backend/.env     # fill DB + GROQ values
npm run build
npm run db:setup --prefix backend
pm2 start backend/src/server.js --name goedu && pm2 save && pm2 startup
```

Nginx reverse proxy (`/etc/nginx/sites-available/goedu`):

```nginx
server {
  server_name yourdomain.com www.yourdomain.com;
  location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Then `sudo ln -s /etc/nginx/sites-available/goedu /etc/nginx/sites-enabled/ && sudo nginx -s reload`
and `sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com`.

---

## Checklist after deployment

- [ ] `https://yourdomain.com/api/health` returns `{"success":true}`
- [ ] Home page shows courses (seed loaded)
- [ ] Login with the demo account works
- [ ] AI Mentor answers (Groq key valid) and shows "10/10 messages left"
- [ ] Rotate the Groq API key if it was ever shared in plain text
