# SunteRaho — Full-Stack Music Streaming Platform

SunteRaho is a full-stack music streaming platform inspired by Spotify, architected for listeners to discover sound and for independent artists to publish tracks, manage their identity, and grow their community.

---

## 🚀 Phase 1 Implementation: Foundation, Authentication & Profiles

### Completed Features

1. **Secure Authentication & Sessions**:
   - HTTP-only, SameSite-hardened cookie session management powered by JWT.
   - Dual-identifier login supporting either **Email** or **Username** with salted bcrypt hashing.
   - Session restoration on reload (`/api/auth/me`).
   - Clean logout workflow with immediate cookie clearing.

2. **Role-Based Access Control (RBAC)**:
   - **Listeners**: Personal profiles, bios, listening history, custom avatar, and streaming-ready account.
   - **Artists & Creators**: Dedicated artist profiles with stage names, music genre chips, verification badges, and social media connectivity (Instagram, Twitter/X, YouTube, Website).
   - **Admins**: Elevated permissions foundation.

3. **Artist Discovery Directory**:
   - Explore verified creators and upcoming independent artists.
   - Filter by genre: *Bollywood, Indie Pop, Hip-Hop, Lo-Fi Beats, EDM, Folk & Acoustic, Sufi, Rock, Classical*.
   - Live query search by artist handle, name, or stage name.

4. **Modern Spotify Aesthetic UI**:
   - Deep obsidian theme (`#0b0c10`), custom Spotify accent glow (`#1ed760`), glassmorphic cards, and Plus Jakarta Sans typography.
   - Persistent sidebar, sticky navbar, and protected route boundaries.

5. **Automated Testing Suite**:
   - Automated backend integration tests using Node.js test runner and Supertest covering registration, duplicate checking, validation, login, cookie issuance, role protection, and profile updates.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, React Router v7, Axios, Lucide React
- **Backend**: Node.js (ESM), Express 4, Cookie-Parser, CORS
- **Database**: MongoDB Atlas, Mongoose ODM
- **Authentication**: JWT with HTTP-only Cookies & Bcrypt
- **Design System**: Vanilla CSS tokens with Glassmorphism and Spotify-grade dark theme

---

## 📂 Project Architecture

```
SunteRaho/
├── client/
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, ProtectedRoute, SocialIcons
│   │   ├── context/          # AuthContext (user, login, register, logout, profile)
│   │   ├── pages/            # Home, Artists, Login, Register, Profile
│   │   ├── services/         # api.js (Axios instance with credentials)
│   │   ├── App.jsx           # Application routing and layout
│   │   ├── index.css         # Design tokens, buttons, glassmorphic cards
│   │   └── main.jsx          # React DOM root
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/           # MongoDB Atlas connection (db.js)
│   │   ├── controllers/      # auth.controller.js, user.controller.js
│   │   ├── middlewares/      # auth.middleware.js, error.middleware.js
│   │   ├── models/           # user.model.js
│   │   ├── routes/           # auth.routes.js, user.routes.js
│   │   ├── utils/            # token.js (JWT & cookie options)
│   │   ├── app.js            # Express app configuration
│   │   └── server.js         # Server entry point
│   ├── tests/                # auth.test.js (Automated integration tests)
│   ├── seed.js               # Database demo seed script
│   ├── .env.example          # Environment variable documentation
│   └── package.json
└── README.md
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Backend listening port | `8008` |
| `db_url` | MongoDB Atlas Connection URI | `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/` |
| `JWT_SECRET` | Secret key used for signing session tokens | `your_secret_key` |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |
| `CLIENT_URL` | Allowed client origin for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js v18+ (Tested on Node v22.19)
- MongoDB Atlas account or local MongoDB instance

### 2. Backend Setup
```bash
cd server
npm install

# Run database seeder to populate sample artists
npm run seed

# Run automated tests
npm test

# Start backend server
npm run dev
# Server will run on http://localhost:8008
```

### 3. Frontend Setup
```bash
cd client
npm install

# Start Vite development server
npm run dev
# Web app will be live on http://localhost:5173
```

---

## 🔌 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new listener or artist.
- `POST /api/auth/login` — Login with username/email and password (sets cookie).
- `GET /api/auth/me` — Retrieve active authenticated session user profile.
- `POST /api/auth/logout` — Invalidate session and clear HTTP-only cookie.

### Users & Artists (`/api/users`)
- `GET /api/users/artists` — Query and filter artists by genre.
- `GET /api/users/:identifier` — Fetch public user or artist profile.
- `PUT /api/users/profile` — Update authenticated user's name, bio, avatar, and artist portfolio.

---

## 🧪 Testing Results

All 14 automated unit and integration tests passing:
- `GET /api/health` — 200 OK
- `POST /api/auth/register` — Validation checks (missing fields, short passwords)
- `POST /api/auth/register` — Successful registration with cookie issuance
- `POST /api/auth/register` — Duplicate email/username prevention (409 Conflict)
- `POST /api/auth/register` — Artist profile initialization with genres and stage name
- `POST /api/auth/login` — Credential verification (valid & invalid password handling)
- `GET /api/auth/me` — Unauthenticated rejection (401) vs Cookie session retrieval (200)
- `PUT /api/users/profile` — Listener profile editing and Artist portfolio updating
- `GET /api/users/artists` — Discovery catalog query
- `POST /api/auth/logout` — Token cookie clearance
