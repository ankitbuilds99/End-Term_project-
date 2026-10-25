import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import Song from '../src/models/song.model.js';
import History from '../src/models/history.model.js';
import Follow from '../src/models/follow.model.js';
import dotenv from 'dotenv';

dotenv.config();

describe('Part 4: SunteRaho Artist Analytics, Reliability & Security Tests', () => {
  const timestamp = Date.now();
  let artistUser, listenerUser;
  let artistCookie, listenerCookie;
  let testSong;

  before(async () => {
    let uri = process.env.db_url || process.env.dbURL || process.env.MONGO_URI;
    if (uri && uri.includes('.mongodb.net/') && !uri.includes('.mongodb.net/sunteraho')) {
      uri = uri.replace('.mongodb.net/', '.mongodb.net/sunteraho?retryWrites=true&w=majority');
    }
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }

    // Register Artist
    const resA = await request(app).post('/api/auth/register').send({
      name: 'Analytics Artist',
      username: `stat_art_${timestamp}`,
      email: `stat_art_${timestamp}@test.com`,
      password: 'password123',
      role: 'artist',
      stageName: 'Stat Maestro',
      genres: ['Bollywood', 'Classical'],
    });
    artistUser = resA.body.user;
    artistCookie = resA.headers['set-cookie'].find((c) => c.startsWith('token=')).split(';')[0];

    // Register Listener
    const resL = await request(app).post('/api/auth/register').send({
      name: 'Stat Listener',
      username: `stat_listen_${timestamp}`,
      email: `stat_listen_${timestamp}@test.com`,
      password: 'password123',
      role: 'listener',
    });
    listenerUser = resL.body.user;
    listenerCookie = resL.headers['set-cookie'].find((c) => c.startsWith('token=')).split(';')[0];

    // Create a published track for this artist
    testSong = await Song.create({
      title: 'Stat Symphony',
      artist: artistUser._id,
      genre: 'Bollywood',
      audioUrl: 'https://example.com/audio.mp3',
      duration: 180,
      isPublished: true,
      playsCount: 0,
    });
  });

  after(async () => {
    // Cleanup created test data
    if (testSong) {
      await Song.findByIdAndDelete(testSong._id);
      await History.deleteMany({ song: testSong._id });
    }
    if (artistUser) {
      await User.findByIdAndDelete(artistUser._id);
      await Follow.deleteMany({ artist: artistUser._id });
    }
    if (listenerUser) {
      await User.findByIdAndDelete(listenerUser._id);
    }
    await mongoose.disconnect();
  });

  // --- 1. Authentication & Role Enforcement on Analytics ---
  test('GET /api/songs/artist/analytics requires authentication (401)', async () => {
    const res = await request(app).get('/api/songs/artist/analytics');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('GET /api/songs/artist/analytics blocks regular listener accounts (403)', async () => {
    const res = await request(app)
      .get('/api/songs/artist/analytics')
      .set('Cookie', listenerCookie);
    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  test('GET /api/songs/artist/analytics permits artist and returns accurate baseline', async () => {
    const res = await request(app)
      .get('/api/songs/artist/analytics?timeframe=all')
      .set('Cookie', artistCookie);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.timeframe, 'all');
    assert.ok(res.body.metrics);
    assert.equal(res.body.metrics.publishedTracks, 1);
    assert.equal(res.body.metrics.totalPlays, 0);
    assert.equal(res.body.metrics.totalFollowers, 0);
    assert.ok(Array.isArray(res.body.timeline));
    assert.ok(Array.isArray(res.body.topTracks));
    assert.ok(typeof res.body.genreDistribution === 'object');
  });

  // --- 2. Live Validation: Streams, Followers and Date Filtering ---
  test('Validating listening events dynamically updates artist analytics and listener counts', async () => {
    // 1. Follow artist
    await request(app)
      .post(`/api/users/${artistUser._id}/follow`)
      .set('Cookie', listenerCookie);

    // 2. Record validated stream (listenDuration >= 30s)
    const playRes = await request(app)
      .post(`/api/songs/${testSong._id}/play`)
      .set('Cookie', listenerCookie)
      .send({ listenDuration: 45 });
    assert.equal(playRes.status, 200);
    assert.equal(playRes.body.success, true);
    assert.equal(playRes.body.playsCount, 1);

    // 3. Query analytics again
    const res = await request(app)
      .get('/api/songs/artist/analytics?timeframe=all')
      .set('Cookie', artistCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.metrics.totalPlays, 1);
    assert.equal(res.body.metrics.uniqueListeners, 1);
    assert.equal(res.body.metrics.totalFollowers, 1);
    assert.ok(res.body.metrics.totalListeningMinutes > 0);
    assert.equal(res.body.topTracks.length, 1);
    assert.equal(res.body.topTracks[0].title, 'Stat Symphony');
    assert.equal(res.body.topTracks[0].playsCount, 1);
  });

  test('GET /api/songs/artist/analytics accurately filters by 30d and 7d', async () => {
    const res30d = await request(app)
      .get('/api/songs/artist/analytics?timeframe=30d')
      .set('Cookie', artistCookie);
    assert.equal(res30d.status, 200);
    assert.equal(res30d.body.timeframe, '30d');
    assert.equal(res30d.body.metrics.totalPlays, 1);

    const res7d = await request(app)
      .get('/api/songs/artist/analytics?timeframe=7d')
      .set('Cookie', artistCookie);
    assert.equal(res7d.status, 200);
    assert.equal(res7d.body.timeframe, '7d');
    assert.equal(res7d.body.metrics.totalPlays, 1);
  });

  // --- 3. Reliability: CastError and Malformed ObjectIds ---
  test('CastError on malformed song ID returns 400 Bad Request instead of 500', async () => {
    const res = await request(app).get('/api/songs/not-a-valid-object-id');
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.toLowerCase().includes('invalid'));
  });

  test('CastError on malformed playlist ID returns 400 Bad Request', async () => {
    const res = await request(app).get('/api/playlists/bad-playlist-id-12345');
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.toLowerCase().includes('invalid'));
  });

  test('CastError on malformed follow artist ID returns 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/users/malformed-artist-id/follow')
      .set('Cookie', listenerCookie);
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.toLowerCase().includes('invalid'));
  });

  // --- 4. Missing Resource: Non-existent Valid ObjectId returns 404 ---
  test('Non-existent valid ObjectId returns 404 Not Found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/songs/${nonExistentId}`);
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});
