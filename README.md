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

---

## 🎧 Phase 3 Implementation: Following, Likes, Playlists, History & Discovery

### Completed Features

1. **Follow Model & Artist Network**:
   - Schema fields: `follower` (User ref), `artist` (User ref), `createdAt`.
   - Unique compound index `{ follower: 1, artist: 1 }` ensuring duplicate follows cannot occur.
   - Self-follow prevention with HTTP 400 Bad Request.
   - Follower count calculation dynamically reflecting follow/unfollow actions.
   - Endpoints:
     - `POST /api/users/:artistId/follow` — Toggle follow/unfollow with race-condition deduplication.
     - `GET /api/users/:artistId/is-following` — Check if current user follows an artist and get total follower count.
     - `GET /api/users/me/following` — List artists followed by current user.

2. **Like Model & Liked Songs Collection**:
   - Schema fields: `user` (User ref), `song` (Song ref), `createdAt`.
   - Unique compound index `{ user: 1, song: 1 }` preventing duplicate likes.
   - Persistent Liked Songs page (`/liked`) with hero banner, total count, duration calculation, un-like action, and "Play All" queue integration.
   - Fast ID retrieval for instant UI heart states across the whole application:
     - `POST /api/songs/:id/like` — Toggle like/unlike track.
     - `GET /api/songs/user/liked` — Paginated list of liked tracks with populated artist profiles.
     - `GET /api/songs/user/liked-ids` — Lightweight list of liked song IDs for fast client heart rendering.

3. **Playlists (CRUD, Ownership & Privacy)**:
   - Schema fields: `title`, `description`, `coverUrl`, `isPublic`, `owner` (User ref), `songs` (ordered array of Song refs), `timestamps`.
   - Ownership enforcement: Only the playlist owner (or admin) can edit metadata, delete, add tracks, remove tracks, or reorder tracks.
   - Privacy security: Private playlists (`isPublic: false`) are strictly inaccessible to unauthorized users (returns 404).
   - In-place track reordering: Supports custom track order persisted in MongoDB.
   - 1-Click "Add to Playlist" modal with inline playlist creation.
   - Playlist playback: Seamlessly loads entire playlist in custom track order into the global player and queue.
   - Endpoints:
     - `POST /api/playlists` — Create a new playlist.
     - `GET /api/playlists` — Browse public community playlists.
     - `GET /api/playlists/my-playlists` — Retrieve authenticated user's private and public playlists.
     - `GET /api/playlists/:id` — Get playlist with ordered tracks (enforces privacy).
     - `PUT /api/playlists/:id` — Update playlist title, description, cover, and visibility (owner only).
     - `DELETE /api/playlists/:id` — Delete playlist (owner only).
     - `POST /api/playlists/:id/songs` — Add track to playlist (prevents duplicate addition, owner only).
     - `DELETE /api/playlists/:id/songs/:songId` — Remove track from playlist (owner only).
     - `PUT /api/playlists/:id/reorder` — Persist ordered array of song IDs (owner only).

4. **User-Specific Listening History**:
   - Schema fields: `user` (User ref), `song` (Song ref), `listenDuration`, `playedAt`.
   - Recorded automatically on validated play events (>= 30s playback).
   - Chronological timeline (`playedAt: -1`) with relative time tags ("Just now", "10m ago", etc.).
   - History privacy: Strictly isolated per user. Other users cannot inspect listening history.
   - Endpoints:
     - `GET /api/users/me/history` — Paginated chronological listening history.
     - `DELETE /api/users/me/history` — Clear personal listening history.

5. **Rule-Based Personalized Discovery & Fallback**:
   - Deterministic multi-factor scoring algorithm:
     - **Followed Artist Boost**: +50 points if track belongs to an artist the user follows.
     - **Preferred Genre Match**: +30 points for user's primary favorite genre, +15 points for secondary genre (derived from likes and listening history).
     - **Popularity Factor**: Scaled up to +20 points based on total streams.
     - **Recency Bonus**: +10 points for tracks released within the last 30 days.
     - **Freshness Bonus**: +15 points for tracks not yet listened to by this user.
   - **Discovery Fallback for New Users & Guests**:
     - Automatically falls back to top trending published tracks across diverse genres when user has no history or is not logged in.
   - Endpoints:
     - `GET /api/songs/discovery/personalized` — Returns personalized or fallback discovery feed.

---

## 🧪 Testing Results

All 55 automated integration and unit tests passing across all three parts:

```
▶ SunteRaho Authentication & Profile API Tests (14 passed)
▶ SoundSphere Part 3: Following, Likes, Playlists, History & Discovery Tests
  ▶ Follow System & Counts (6 passed)
  ▶ Like System & Liked Songs (5 passed)
  ▶ Playlists: CRUD, Ownership, Privacy & Ordering (9 passed)
  ▶ Listening History & Privacy (3 passed)
  ▶ Rule-Based Personalized Discovery & Fallback (2 passed)
✔ SoundSphere Part 3 Tests (25 passed)
▶ SunteRaho Music Catalogue, Media Uploads & Player API Tests (16 passed)

Total: 55 tests, 0 failures.
```

