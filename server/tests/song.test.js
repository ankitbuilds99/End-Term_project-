import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import Song from '../src/models/song.model.js';
import dotenv from 'dotenv';

dotenv.config();

describe('SunteRaho Music Catalogue, Media Uploads & Player API Tests', () => {
  const timestamp = Date.now();
  let artistAUser, artistBUser, listenerUser;
  let artistACookie, artistBCookie, listenerCookie;
  let createdSongId;
  let unpublishedSongId;

  before(async () => {
    let uri = process.env.db_url || process.env.dbURL || process.env.MONGO_URI;
    if (uri && uri.includes('.mongodb.net/') && !uri.includes('.mongodb.net/sunteraho')) {
      uri = uri.replace('.mongodb.net/', '.mongodb.net/sunteraho?retryWrites=true&w=majority');
    }
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }

    // Register Artist A
    const resA = await request(app).post('/api/auth/register').send({
      name: 'Artist Alpha',
      username: `art_a_${timestamp}`,
      email: `art_a_${timestamp}@test.com`,
      password: 'password123',
      role: 'artist',
      stageName: 'Alpha Beats',
      genres: ['Bollywood', 'Lo-Fi Beats'],
    });
    artistAUser = resA.body.user;
    artistACookie = resA.headers['set-cookie'].find((c) => c.startsWith('token=')).split(';')[0];

    // Register Artist B
    const resB = await request(app).post('/api/auth/register').send({
      name: 'Artist Beta',
      username: `art_b_${timestamp}`,
      email: `art_b_${timestamp}@test.com`,
      password: 'password123',
      role: 'artist',
      stageName: 'Beta Sounds',
      genres: ['Electronic / EDM'],
    });
    artistBUser = resB.body.user;
    artistBCookie = resB.headers['set-cookie'].find((c) => c.startsWith('token=')).split(';')[0];

    // Register Listener
    const resL = await request(app).post('/api/auth/register').send({
      name: 'Regular Listener',
      username: `listen_${timestamp}`,
      email: `listen_${timestamp}@test.com`,
      password: 'password123',
      role: 'listener',
    });
    listenerUser = resL.body.user;
    listenerCookie = resL.headers['set-cookie'].find((c) => c.startsWith('token=')).split(';')[0];
  });

  after(async () => {
    // Cleanup created test users and songs
    if (artistAUser && artistBUser && listenerUser) {
      await User.deleteMany({
        _id: { $in: [artistAUser._id, artistBUser._id, listenerUser._id] },
      });
      await Song.deleteMany({
        artist: { $in: [artistAUser._id, artistBUser._id] },
      });
    }
    await mongoose.disconnect();
  });

  test('POST /api/songs should reject unauthenticated requests with 401', async () => {
    const res = await request(app).post('/api/songs').send({
      title: 'Unauthorized Track',
      genre: 'Pop',
    });
    assert.equal(res.status, 401);
  });

  test('POST /api/songs should reject listener accounts with 403 Forbidden', async () => {
    const res = await request(app)
      .post('/api/songs')
      .set('Cookie', listenerCookie)
      .send({
        title: 'Listener Track Attempt',
        genre: 'Pop',
        audioUrl: 'https://example.com/audio.mp3',
        duration: 180,
      });
    assert.equal(res.status, 403);
    assert.match(res.body.message, /Forbidden/);
  });

  test('POST /api/songs should fail if title or genre is missing', async () => {
    const res = await request(app)
      .post('/api/songs')
      .set('Cookie', artistACookie)
      .send({
        title: '',
        genre: '',
      });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('POST /api/songs should allow artist to create a published track', async () => {
    const res = await request(app)
      .post('/api/songs')
      .set('Cookie', artistACookie)
      .field('title', `Midnight Rain ${timestamp}`)
      .field('genre', 'Lo-Fi Beats')
      .field('album', 'Late Night Sessions')
      .field('duration', 210)
      .field('isPublished', 'true')
      .field('audioUrl', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.song.title, `Midnight Rain ${timestamp}`);
    assert.equal(res.body.song.isPublished, true);
    assert.equal(res.body.song.artist._id.toString(), artistAUser._id.toString());
    createdSongId = res.body.song._id;
  });

  test('POST /api/songs should allow artist to create an unpublished draft track', async () => {
    const res = await request(app)
      .post('/api/songs')
      .set('Cookie', artistACookie)
      .field('title', `Secret Demo ${timestamp}`)
      .field('genre', 'Lo-Fi Beats')
      .field('duration', 150)
      .field('isPublished', 'false')
      .field('audioUrl', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3');

    assert.equal(res.status, 201);
    assert.equal(res.body.song.isPublished, false);
    unpublishedSongId = res.body.song._id;
  });

  test('GET /api/songs should return only published tracks in public catalogue', async () => {
    const res = await request(app).get('/api/songs');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.songs));

    // Verify all returned songs are published
    const anyUnpublished = res.body.songs.some((s) => s.isPublished === false);
    assert.equal(anyUnpublished, false, 'No unpublished songs should ever appear in public catalogue');

    // The created published song should be in results
    const foundPublished = res.body.songs.some((s) => s._id.toString() === createdSongId.toString());
    assert.equal(foundPublished, true);

    // The unpublished song should NOT be in results
    const foundUnpublished = res.body.songs.some((s) => s._id.toString() === unpublishedSongId.toString());
    assert.equal(foundUnpublished, false);
  });

  test('GET /api/songs search query and genre filtering', async () => {
    const res = await request(app).get(`/api/songs?search=Midnight&genre=Lo-Fi+Beats`);

    assert.equal(res.status, 200);
    assert.ok(res.body.songs.length >= 1);
    const track = res.body.songs.find((s) => s._id.toString() === createdSongId.toString());
    assert.ok(track, 'Searched track should be found');
  });

  test('GET /api/songs/:id public access to unpublished track should return 404', async () => {
    const res = await request(app).get(`/api/songs/${unpublishedSongId}`);
    assert.equal(res.status, 404);
  });

  test('GET /api/songs/:id owner artist access to unpublished track should succeed', async () => {
    const res = await request(app)
      .get(`/api/songs/${unpublishedSongId}`)
      .set('Cookie', artistACookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.song._id.toString(), unpublishedSongId.toString());
  });

  test('PUT /api/songs/:id should prevent Artist B from updating Artist A track (ownership check)', async () => {
    const res = await request(app)
      .put(`/api/songs/${createdSongId}`)
      .set('Cookie', artistBCookie)
      .send({
        title: 'Hacked Title Attempt',
      });

    assert.equal(res.status, 403);
    assert.match(res.body.message, /Forbidden/);
  });

  test('PUT /api/songs/:id should allow owner artist to update track metadata', async () => {
    const res = await request(app)
      .put(`/api/songs/${createdSongId}`)
      .set('Cookie', artistACookie)
      .field('title', `Midnight Rain Remastered ${timestamp}`)
      .field('album', 'Platinum Edition');

    assert.equal(res.status, 200);
    assert.equal(res.body.song.title, `Midnight Rain Remastered ${timestamp}`);
    assert.equal(res.body.song.album, 'Platinum Edition');
  });

  test('GET /api/songs/artist/my-tracks should return all songs of current artist', async () => {
    const res = await request(app)
      .get('/api/songs/artist/my-tracks')
      .set('Cookie', artistACookie);

    assert.equal(res.status, 200);
    assert.ok(res.body.songs.length >= 2, 'Should include both published and unpublished tracks');
    assert.ok(res.body.stats.totalTracks >= 2);
  });

  test('POST /api/songs/:id/play should enforce listening threshold', async () => {
    // Track duration is 210s. Threshold requires 30s.
    // Try sending only 10s playback:
    const failRes = await request(app)
      .post(`/api/songs/${createdSongId}/play`)
      .send({
        listenDuration: 10,
        sessionId: 'test_session_123',
      });

    assert.equal(failRes.status, 400);
    assert.match(failRes.body.message, /Listening threshold not met/);

    // Now send valid 35s playback:
    const successRes = await request(app)
      .post(`/api/songs/${createdSongId}/play`)
      .send({
        listenDuration: 35,
        sessionId: `test_session_${timestamp}`,
      });

    assert.equal(successRes.status, 200);
    assert.equal(successRes.body.success, true);
    assert.equal(successRes.body.playsCount, 1);
  });

  test('POST /api/songs/:id/play should deduplicate rapid plays within cooldown window', async () => {
    const duplicateRes = await request(app)
      .post(`/api/songs/${createdSongId}/play`)
      .send({
        listenDuration: 40,
        sessionId: `test_session_${timestamp}`, // Same session id
      });

    assert.equal(duplicateRes.status, 200);
    assert.equal(duplicateRes.body.cooldown, true);
    assert.equal(duplicateRes.body.playsCount, 1, 'Plays count should not increment on cooldown');
  });

  test('DELETE /api/songs/:id should prevent non-owner from deleting', async () => {
    const res = await request(app)
      .delete(`/api/songs/${createdSongId}`)
      .set('Cookie', artistBCookie);

    assert.equal(res.status, 403);
  });

  test('DELETE /api/songs/:id should allow owner artist to delete their track', async () => {
    const res = await request(app)
      .delete(`/api/songs/${createdSongId}`)
      .set('Cookie', artistACookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    // Verify track is gone
    const verifyRes = await request(app).get(`/api/songs/${createdSongId}`);
    assert.equal(verifyRes.status, 404);
  });
});
