# SunteRaho — Full-Stack Music Streaming Platform

SunteRaho is a full-stack music streaming platform inspired by Spotify, architected for listeners to discover sound and for independent artists to publish tracks, manage their identity, and grow their community.

---

## 🚀 Phase 1 Implementation: Foundation, Authentication & Profiles

- **Secure Authentication & Sessions**: HTTP-only, SameSite-hardened cookie session management powered by JWT and bcrypt password hashing. Supports email or username login.
- **Role-Based Access Control (RBAC)**: Listeners (custom avatar, personal bio), Artists (stage name, music genres, verified badge, social links), and Admins.
- **Artist Discovery Directory**: Browse and filter verified creators and independent artists by genre.
- **Spotify Aesthetic UI**: Deep obsidian theme (`#0b0c10`), Spotify green accents (`#1ed760`), glassmorphic cards, and Plus Jakarta Sans typography.

---

## 🎵 Phase 2 Implementation: Music Catalogue, Media Uploads & Streaming Player

### Completed Features

1. **Song Model & MongoDB Indexes**:
   - Schema fields: `title`, `artist` (User ref), `genre`, `album`, `audioUrl`, `artworkUrl`, `duration`, `playsCount`, `isPublished`, `releaseDate`, `audioFileSize`, `audioMimeType`.
   - Compound indexes: `{ isPublished: 1, playsCount: -1 }`, `{ isPublished: 1, releaseDate: -1 }`, `{ isPublished: 1, genre: 1, playsCount: -1 }`, and `{ artist: 1, isPublished: 1 }`.
   - Text indexing on `title` and `album` for fast search.

2. **Public Music Catalogue & Search**:
   - Endpoints strictly enforce publication visibility: only tracks with `isPublished: true` are returned to public listeners.
   - Real-time search across track titles, albums, genres, and artist stage names.
   - Genre filter chips (*Bollywood, Indie Pop, EDM, Folk & Acoustic, Lo-Fi Beats, Hip-Hop, Sufi, Rock*).
   - Sorting by: Popularity (`playsCount`), Latest Releases (`releaseDate`), Title (A-Z), and Oldest.
   - Server-side pagination with metadata (`total`, `page`, `pages`, `limit`).

3. **Artist Studio & Media Upload System**:
   - Artist-only studio for uploading tracks (`/studio`).
   - Supports audio files (MP3, WAV, OGG, M4A, AAC, FLAC) up to 35MB with automatic duration detection via `music-metadata`.
   - Supports cover artwork images (JPEG, PNG, WEBP) up to 6MB.
   - Automated upload failure handling and cleanup: deletes partial or rejected files on disk if validation fails.
   - Resource ownership enforcement: artists can only view drafts, edit metadata, toggle public/private status, or delete tracks they own.

4. **Shared Persistent Audio Player**:
   - Single audio player fixed across navigation (`client/src/components/AudioPlayer.jsx`).
   - Controls: Play, Pause, Seek bar, Previous, Next, Volume slider, Mute toggle, Shuffle, and Repeat modes (Off, All, One).
   - Interactive Slide-out Queue popover drawer displaying upcoming songs with direct track jumping, queue removal, and clear queue actions.
   - Edge-case handling:
     - Handles autoplay restrictions gracefully (`NotAllowedError` caught without crashing).
     - Buffering spinners and loading indicators.
     - Broken audio error handling with user alert banner.
     - Dynamic duration recovery on `loadedmetadata`.

5. **Listening Threshold Play Validation**:
   - Enforces a documented listening threshold rule (`listenDuration >= 30s` or `>= 50%` of track duration for short tracks).
   - Anti-spam & rate-limiting cooldown window (60s) preventing duplicate client-side counter manipulation.
   - Atomically increments track `playsCount` in database.

6. **Authorized Seed Audio**:
   - Database seeder includes authorized, royalty-free audio tracks from SoundHelix and high-resolution Unsplash artwork.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, React Router v7, Axios, Lucide React
- **Backend**: Node.js (ESM), Express 4, Cookie-Parser, CORS, Multer, Music-Metadata
- **Database**: MongoDB Atlas, Mongoose ODM
- **Authentication**: JWT with HTTP-only Cookies & Bcrypt
- **Design System**: Vanilla CSS tokens with Glassmorphism and Spotify-grade dark theme

---

## 📂 Project Architecture

```
SunteRaho/
├── client/
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, SongCard, AudioPlayer, ProtectedRoute, SocialIcons
│   │   ├── context/          # AuthContext, PlayerContext (global persistent audio state)
│   │   ├── pages/            # Home, Catalogue, Artists, ArtistStudio, Login, Register, Profile
│   │   ├── services/         # api.js (Axios instance with credentials & media URL resolver)
│   │   ├── App.jsx           # Application routing and layout with persistent player
│   │   ├── index.css         # Design tokens, buttons, glassmorphic cards
│   │   └── main.jsx          # React DOM root
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/           # MongoDB Atlas connection (db.js)
│   │   ├── controllers/      # auth.controller.js, user.controller.js, song.controller.js
│   │   ├── middlewares/      # auth.middleware.js, error.middleware.js
│   │   ├── models/           # user.model.js, song.model.js
│   │   ├── routes/           # auth.routes.js, user.routes.js, song.routes.js
│   │   ├── utils/            # token.js, upload.js (Multer, metadata, file cleanup)
│   │   ├── app.js            # Express app configuration & static uploads serving
│   │   └── server.js         # Server entry point
│   ├── uploads/              # Local storage for audio and cover artwork
│   │   ├── audio/
│   │   └── artwork/
│   ├── tests/                # auth.test.js, song.test.js (Automated integration tests)
│   ├── seed.js               # Database demo seed script (artists & royalty-free tracks)
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

# Run database seeder to populate sample artists and demo songs
npm run seed

# Run automated tests (runs all 30 tests)
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

### Music Catalogue & Player (`/api/songs`)
- `GET /api/songs` — Public catalogue with search, genre filtering, and sorting (`popular`, `latest`, `title`, `oldest`). Returns published tracks only.
- `GET /api/songs/:id` — Get track details (enforces publication visibility).
- `GET /api/songs/artist/my-tracks` — Artist-only route returning all tracks (published and drafts) with stats.
- `POST /api/songs` — Artist-only route to upload new track with audio and artwork files.
- `PUT /api/songs/:id` — Artist-only route to edit metadata and toggle publish status (owner verified).
- `DELETE /api/songs/:id` — Artist-only route to permanently delete track and disk files (owner verified).
- `POST /api/songs/:id/play` — Validated listening threshold event (requires >= 30s playback, cooldown deduplicated).

---

## 🧪 Testing Results

All 30 automated integration and unit tests passing:

```
▶ SunteRaho Authentication & Profile API Tests
  ✔ GET /api/health should return 200 and healthy status
  ✔ POST /api/auth/register should fail when required fields are missing
  ✔ POST /api/auth/register should fail when password is less than 6 chars
  ✔ POST /api/auth/register should successfully register a Listener and set auth cookie
  ✔ POST /api/auth/register should fail on duplicate email or username
  ✔ POST /api/auth/register should successfully register an Artist with artistProfile
  ✔ POST /api/auth/login should fail with invalid credentials
  ✔ POST /api/auth/login should succeed with valid credentials and return user
  ✔ GET /api/auth/me should reject unauthenticated request with 401
  ✔ GET /api/auth/me should return current user when authenticated via cookie
  ✔ PUT /api/users/profile should update user profile
  ✔ PUT /api/users/profile should update artist profile details for artist
  ✔ GET /api/users/artists should list artists
  ✔ POST /api/auth/logout should clear the token cookie
✔ SunteRaho Authentication & Profile API Tests (14 passed)

▶ SunteRaho Music Catalogue, Media Uploads & Player API Tests
  ✔ POST /api/songs should reject unauthenticated requests with 401
  ✔ POST /api/songs should reject listener accounts with 403 Forbidden
  ✔ POST /api/songs should fail if title or genre is missing
  ✔ POST /api/songs should allow artist to create a published track
  ✔ POST /api/songs should allow artist to create an unpublished draft track
  ✔ GET /api/songs should return only published tracks in public catalogue
  ✔ GET /api/songs search query and genre filtering
  ✔ GET /api/songs/:id public access to unpublished track should return 404
  ✔ GET /api/songs/:id owner artist access to unpublished track should succeed
  ✔ PUT /api/songs/:id should prevent Artist B from updating Artist A track (ownership check)
  ✔ PUT /api/songs/:id should allow owner artist to update track metadata
  ✔ GET /api/songs/artist/my-tracks should return all songs of current artist
  ✔ POST /api/songs/:id/play should enforce listening threshold
  ✔ POST /api/songs/:id/play should deduplicate rapid plays within cooldown window
  ✔ DELETE /api/songs/:id should prevent non-owner from deleting
  ✔ DELETE /api/songs/:id should allow owner artist to delete their track
✔ SunteRaho Music Catalogue, Media Uploads & Player API Tests (16 passed)

Total: 30 tests, 0 failures.
```
