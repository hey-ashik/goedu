# GoEdu – Online Courses in Bangladesh with Certificates

Full-stack learning management platform modelled on [goedu.ac](https://goedu.ac/):
a React + Tailwind CSS frontend, a Node.js/Express REST API and a MySQL database,
with an AI Mentor chatbot powered by Groq (`openai/gpt-oss-120b`).

```
goedu/
├── frontend/                 React 18 + Vite + Tailwind CSS (SPA)
│   ├── public/               static assets (logo, images, course thumbnails)
│   └── src/
│       ├── components/       layout (header, footer, cart drawer), home sections, chat widget, common UI
│       ├── pages/            route pages (+ pages/dashboard for the learner area)
│       ├── context/          Auth, Cart, Theme, Chat providers
│       ├── hooks/            useApi, useSiteSettings, ...
│       ├── services/api.js   axios client + typed API helpers
│       └── utils/            formatting helpers
├── backend/                  Node.js + Express + MySQL (mysql2)
│   ├── src/
│   │   ├── config/           env + db pool
│   │   ├── controllers/      route handlers (courses, auth, cart, orders, chat, ...)
│   │   ├── routes/           express routers (/api/v1/*)
│   │   ├── middleware/       auth (JWT), guest id, validation, error handler
│   │   ├── services/         Groq client, per-user chat rate limiting
│   │   ├── app.js            express app (also serves frontend/dist in production)
│   │   └── server.js         entry point
│   └── database/
│       ├── schema.sql        all tables
│       ├── migrate.js        creates database + tables
│       └── seed/             seed.js + data/*.json (281 courses, categories, bundles, blog, ...)
├── Resources/                original reference assets (untouched)
├── package.json              root scripts (build / start for Hostinger)
└── DEPLOYMENT.md             step by step Hostinger + GitHub deployment guide
```

## Features

- Pixel-faithful port of goedu.ac: hero with live course search, trust badges, featured bundle,
  popular courses by category, instructors slider, stats, top picks, AI CTA, blog, testimonials, footer
- Courses catalogue with category tree, tier / level / language filters, search, sorting, pagination
- Course detail page: curriculum (sections & lessons), what you learn, instructor, reviews, sticky buy card
- Bundles, Mentorship (mentor directory + 1:1 booking), Learner Plus subscription (monthly / yearly),
  Blog with comments, About, Contact, Become an instructor, policy pages
- Authentication (JWT), cart (guest + user, merged on login), checkout, enrolments, wishlist, orders
- Learner dashboard: overview, my learning + course player with progress, purchases, wishlist,
  mentor sessions, subscription resources, micro courses, profile
- AI Mentor chatbot (Groq, `openai/gpt-oss-120b`) that recommends real courses from the catalogue.
  **Rate limit per user: 10 messages, then a 30 minute cool-down** (stored in MySQL, works for guests and logged-in users)
- Dark mode, fully responsive (mobile → 4K)

## Local development

Requirements: Node.js 18+, MySQL 5.7+/8 (or MariaDB 10.4+).

```bash
# 1. install dependencies
npm run install:all

# 2. configure the backend
cp backend/.env.example backend/.env      # then edit DB_* and GROQ_API_KEY

# 3. create the database + tables and load the seed data
npm run db:setup

# 4. run API (http://localhost:5000) and frontend (http://localhost:5173) together
npm run dev
```

Demo learner account: `demo@goedu.ac` / `Demo@1234`

## Production build

```bash
npm run build     # installs deps and builds frontend/dist
npm start         # starts the API which also serves the built frontend
```

The Express server serves `frontend/dist` for every non-API route, so a single Node.js process hosts the whole site.

## Environment variables (backend/.env)

| Variable | Description |
| --- | --- |
| `PORT` | HTTP port (Hostinger injects its own) |
| `APP_URL` | Public site URL (used in AI answers / links) |
| `CORS_ORIGINS` | Comma separated allowed origins |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Auth token signing |
| `GROQ_API_KEY`, `GROQ_MODEL` | Groq API key and model (`openai/gpt-oss-120b`) |
| `CHAT_LIMIT`, `CHAT_WINDOW_MINUTES` | Chatbot quota per user (default 10 / 30) |

## API overview (`/api/v1`)

| Area | Endpoints |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `PUT /auth/profile`, `PUT /auth/password` |
| Courses | `GET /courses`, `GET /courses/search`, `GET /courses/popular`, `GET /courses/top-picks`, `GET /courses/:slug`, `GET /courses/:slug/related` |
| Catalogue | `GET /categories`, `GET /bundles`, `GET /bundles/:slug`, `GET /instructors`, `GET /instructors/:slug` |
| Mentorship | `GET /mentorship/mentors`, `GET /mentorship/categories`, `GET /mentorship/mentors/:slug`, `GET/POST /mentorship/bookings` |
| Blog | `GET /articles`, `GET /articles/categories`, `GET /articles/trending`, `GET /articles/:slug`, `POST /articles/:slug/comments` |
| Site | `GET /site/settings`, `GET /site/home`, `GET /site/testimonials`, `GET /site/pages/:slug`, `POST /site/newsletter`, `POST /site/contact`, `POST /site/apply-instructor` |
| Commerce | `GET/POST/DELETE /cart`, `GET /wishlist`, `POST /wishlist/toggle`, `GET /orders`, `POST /orders/checkout`, `POST /orders/enroll-free` |
| Subscription | `GET /subscription/packages`, `GET /subscription/library`, `POST /subscription/subscribe`, `POST /subscription/cancel` |
| Learning | `GET /learning`, `GET /learning/:slug`, `POST /learning/:slug/progress`, `POST /reviews` |
| AI Mentor | `GET /chat/status`, `GET /chat/history`, `POST /chat/new`, `POST /chat` |

## Notes

- Payments: checkout currently uses a demo gateway that marks orders as paid instantly.
  Connect SSLCommerz / bKash in `backend/src/controllers/order.controller.js` for live payments.
- Course curricula: section titles, the first section's lessons and free-preview flags come from the
  public course pages; remaining lessons are structural placeholders named `<Section> - Lesson N`
  so every course matches its published lesson count. Replace them with real lesson titles / video URLs
  in the `course_lessons` table.
