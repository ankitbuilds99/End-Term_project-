import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import Song from '../src/models/song.model.js';
import Follow from '../src/models/follow.model.js';
import Like from '../src/models/like.model.js';
import Playlist from '../src/models/playlist.model.js';
import History from '../src/models/history.model.js';
import dotenv from 'dotenv';

dotenv.config();

describe('SoundSphere Part 3: Following, Likes, Playlists, History & Discovery Tests', () => {
  const timestamp = Date.now();
  let artistUser, listener1User, listener2User;
  let artistCookie, listener1Cookie, listener2Cookie;
  let song1, song2, song3;
  let publicPlaylistId, privatePlaylistId;

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
      name: 'Artist P3',
      username: `art_p3_${timestamp}`,
      email: `art_p3_${timestamp}@test.com`,
      password: 'password123',
      role: 'artist',
      stageName: 'P3 Master',
      genres: ['Bollywood', 'Romantic Pop'],
    });
    artistUser = resA.body.user;
    artistCookie = resA.headers['set-cookie'].find((c) => c.startsWith('token=')).split(';')[0];

    // Register Listener 1
    const resL1 = await request(app).post('/api/auth/register').send({
      name: 'Listener One',
      username: `l1_${timestamp}`,
      email: `l1_${timestamp}@test.com`,
      password: 'password123',
      role: 'listener',
    });
    listener1User = resL1.body.user;
    listener1Cookie = resL1.headers['set-cookie'].find((c) => c.startsWith('token=')).split(';')[0];

    // Register Listener 2
    const resL2 = await request(app).post('/api/auth/register').send({
      name: 'Listener Two',
      username: `l2_${timestamp}`,
      email: `l2_${timestamp}@test.com`,
      password: 'password123',
      role: 'listener',
    });
    listener2User = resL2.body.user;
    listener2Cookie = resL2.headers['set-cookie'].find((c) => c.startsWith('token=')).split(';')[0];

    // Create 3 published songs for tests
    song1 = await Song.create({
      title: `Track 1 ${timestamp}`,
      artist: artistUser._id,
      genre: 'Bollywood',
      audioUrl: '/uploads/audio/test1.mp3',
      artworkUrl: '/uploads/artwork/test1.jpg',
      duration: 180,
      isPublished: true,
      playsCount: 25,
    });

    song2 = await Song.create({
      title: `Track 2 ${timestamp}`,
      artist: artistUser._id,
      genre: 'Romantic Pop',
      audioUrl: '/uploads/audio/test2.mp3',
      artworkUrl: '/uploads/artwork/test2.jpg',
      duration: 210,
      playsCount: 10,
      isPublished: true,
    });

    song3 = await Song.create({
      title: `Track 3 ${timestamp}`,
      artist: artistUser._id,
      genre: 'Sufi & Ghazal',
      audioUrl: '/uploads/audio/test3.mp3',
      artworkUrl: '/uploads/artwork/test3.jpg',
      duration: 240,
      playsCount: 5,
      isPublished: true,
    });
  });

  after(async () => {
    // Clean up test data
    const userIds = [artistUser?._id, listener1User?._id, listener2User?._id].filter(Boolean);
    const songIds = [song1?._id, song2?._id, song3?._id].filter(Boolean);

    await User.deleteMany({ _id: { $in: userIds } });
    await Song.deleteMany({ _id: { $in: songIds } });
    await Follow.deleteMany({ $or: [{ follower: { $in: userIds } }, { artist: { $in: userIds } }] });
    await Like.deleteMany({ user: { $in: userIds } });
    await Playlist.deleteMany({ owner: { $in: userIds } });
    await History.deleteMany({ user: { $in: userIds } });

    await mongoose.disconnect();
  });

  // ==========================================
  // 1. FOLLOW TESTS
  // ==========================================
  describe('Follow System & Counts', () => {
    test('1. Follow an artist successfully', async () => {
      const res = await request(app)
        .post(`/api/users/${artistUser._id}/follow`)
        .set('Cookie', listener1Cookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.isFollowing, true);
      assert.equal(res.body.followerCount, 1);
    });

    test('2. Self-follow is rejected with 400', async () => {
      const res = await request(app)
        .post(`/api/users/${artistUser._id}/follow`)
        .set('Cookie', artistCookie);

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /cannot follow yourself/i);
    });

    test('3. Follow status endpoint reports correct state', async () => {
      const res = await request(app)
        .get(`/api/users/${artistUser._id}/is-following`)
        .set('Cookie', listener1Cookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.isFollowing, true);
      assert.equal(res.body.followerCount, 1);
    });

    test('4. Followed artists list (/api/users/me/following) includes followed artist', async () => {
      const res = await request(app)
        .get('/api/users/me/following')
        .set('Cookie', listener1Cookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.artists.some((a) => a._id.toString() === artistUser._id.toString()));
    });

    test('5. Unfollow artist toggles back correctly', async () => {
      const res = await request(app)
        .post(`/api/users/${artistUser._id}/follow`)
        .set('Cookie', listener1Cookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.isFollowing, false);
      assert.equal(res.body.followerCount, 0);
    });

    test('6. Follow model enforces unique compound index against duplicates', async () => {
      // Re-follow to test database unique constraint
      await Follow.create({ follower: listener1User._id, artist: artistUser._id });

      await assert.rejects(
        async () => {
          await Follow.create({ follower: listener1User._id, artist: artistUser._id });
        },
        (err) => err.code === 11000
      );
    });
  });

  // ==========================================
  // 2. LIKE TESTS
  // ==========================================
  describe('Like System & Liked Songs', () => {
    test('7. Like a song successfully', async () => {
      const res = await request(app)
        .post(`/api/songs/${song1._id}/like`)
        .set('Cookie', listener1Cookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.isLiked, true);
      assert.equal(res.body.likesCount, 1);
    });

    test('8. Liked songs list (/api/songs/user/liked) returns liked song', async () => {
      const res = await request(app)
        .get('/api/songs/user/liked')
        .set('Cookie', listener1Cookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.songs.length, 1);
      assert.equal(res.body.songs[0]._id.toString(), song1._id.toString());
    });

    test('9. Liked song IDs (/api/songs/user/liked-ids) contains liked song ID', async () => {
      const res = await request(app)
        .get('/api/songs/user/liked-ids')
        .set('Cookie', listener1Cookie);

      assert.equal(res.status, 200);
      assert.ok(res.body.songIds.includes(song1._id.toString()));
    });

    test('10. Like model enforces unique compound index against duplicates', async () => {
      await assert.rejects(
        async () => {
          await Like.create({ user: listener1User._id, song: song1._id });
        },
        (err) => err.code === 11000
      );
    });

    test('11. Toggle unlike removes song from liked list', async () => {
      const res = await request(app)
        .post(`/api/songs/${song1._id}/like`)
        .set('Cookie', listener1Cookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.isLiked, false);
      assert.equal(res.body.likesCount, 0);

      const checkRes = await request(app)
        .get('/api/songs/user/liked')
        .set('Cookie', listener1Cookie);
      assert.equal(checkRes.body.songs.length, 0);
    });
  });

  // ==========================================
  // 3. PLAYLIST TESTS (CRUD, Ownership, Privacy, Reordering)
  // ==========================================
  describe('Playlists: CRUD, Ownership, Privacy & Ordering', () => {
    test('12. Create public and private playlists', async () => {
      const pubRes = await request(app)
        .post('/api/playlists')
        .set('Cookie', listener1Cookie)
        .send({
          title: 'My Public Jam',
          description: 'Best Bollywood vibes',
          isPublic: true,
        });

      assert.equal(pubRes.status, 201);
      assert.equal(pubRes.body.playlist.title, 'My Public Jam');
      publicPlaylistId = pubRes.body.playlist._id;

      const privRes = await request(app)
        .post('/api/playlists')
        .set('Cookie', listener1Cookie)
        .send({
          title: 'My Secret Mix',
          description: 'Private meditation',
          isPublic: false,
        });

      assert.equal(privRes.status, 201);
      assert.equal(privRes.body.playlist.isPublic, false);
      privatePlaylistId = privRes.body.playlist._id;
    });

    test('13. Public playlist is viewable by other users and anonymous guests', async () => {
      const resGuest = await request(app).get(`/api/playlists/${publicPlaylistId}`);
      assert.equal(resGuest.status, 200);
      assert.equal(resGuest.body.playlist.title, 'My Public Jam');

      const resOther = await request(app)
        .get(`/api/playlists/${publicPlaylistId}`)
        .set('Cookie', listener2Cookie);
      assert.equal(resOther.status, 200);
    });

    test('14. Private playlist is inaccessible to other users (returns 404)', async () => {
      const resOther = await request(app)
        .get(`/api/playlists/${privatePlaylistId}`)
        .set('Cookie', listener2Cookie);

      assert.equal(resOther.status, 404);
      assert.match(resOther.body.message, /private/i);
    });

    test('15. Private playlist is accessible to its owner', async () => {
      const resOwner = await request(app)
        .get(`/api/playlists/${privatePlaylistId}`)
        .set('Cookie', listener1Cookie);

      assert.equal(resOwner.status, 200);
      assert.equal(resOwner.body.playlist.title, 'My Secret Mix');
    });

    test('16. Add songs to playlist and prevent duplicates', async () => {
      // Add track 1
      const res1 = await request(app)
        .post(`/api/playlists/${publicPlaylistId}/songs`)
        .set('Cookie', listener1Cookie)
        .send({ songId: song1._id });

      assert.equal(res1.status, 200);
      assert.equal(res1.body.playlist.songs.length, 1);

      // Add track 2
      const res2 = await request(app)
        .post(`/api/playlists/${publicPlaylistId}/songs`)
        .set('Cookie', listener1Cookie)
        .send({ songId: song2._id });

      assert.equal(res2.status, 200);
      assert.equal(res2.body.playlist.songs.length, 2);

      // Duplicate addition should fail with 400
      const resDup = await request(app)
        .post(`/api/playlists/${publicPlaylistId}/songs`)
        .set('Cookie', listener1Cookie)
        .send({ songId: song1._id });

      assert.equal(resDup.status, 400);
      assert.match(resDup.body.message, /already in the playlist/i);
    });

    test('17. Non-owner cannot add songs to playlist (returns 403)', async () => {
      const res = await request(app)
        .post(`/api/playlists/${publicPlaylistId}/songs`)
        .set('Cookie', listener2Cookie)
        .send({ songId: song3._id });

      assert.equal(res.status, 403);
      assert.match(res.body.message, /Forbidden/i);
    });

    test('18. Reorder tracks in playlist and verify persistent order', async () => {
      // Reorder: put song2 first, then song1
      const reorderRes = await request(app)
        .put(`/api/playlists/${publicPlaylistId}/reorder`)
        .set('Cookie', listener1Cookie)
        .send({ songIds: [song2._id, song1._id] });

      assert.equal(reorderRes.status, 200);
      assert.equal(reorderRes.body.playlist.songs[0]._id.toString(), song2._id.toString());
      assert.equal(reorderRes.body.playlist.songs[1]._id.toString(), song1._id.toString());

      // Fetch fresh playlist to verify persistence
      const freshRes = await request(app).get(`/api/playlists/${publicPlaylistId}`);
      assert.equal(freshRes.body.playlist.songs[0]._id.toString(), song2._id.toString());
      assert.equal(freshRes.body.playlist.songs[1]._id.toString(), song1._id.toString());
    });

    test('19. Non-owner cannot reorder or delete playlist (returns 403)', async () => {
      const reorderRes = await request(app)
        .put(`/api/playlists/${publicPlaylistId}/reorder`)
        .set('Cookie', listener2Cookie)
        .send({ songIds: [song1._id, song2._id] });
      assert.equal(reorderRes.status, 403);

      const delRes = await request(app)
        .delete(`/api/playlists/${publicPlaylistId}`)
        .set('Cookie', listener2Cookie);
      assert.equal(delRes.status, 403);
    });

    test('20. Remove track from playlist and delete playlist by owner', async () => {
      const remRes = await request(app)
        .delete(`/api/playlists/${publicPlaylistId}/songs/${song2._id}`)
        .set('Cookie', listener1Cookie);

      assert.equal(remRes.status, 200);
      assert.equal(remRes.body.playlist.songs.length, 1);
      assert.equal(remRes.body.playlist.songs[0]._id.toString(), song1._id.toString());

      const delRes = await request(app)
        .delete(`/api/playlists/${publicPlaylistId}`)
        .set('Cookie', listener1Cookie);
      assert.equal(delRes.status, 200);

      const checkRes = await request(app).get(`/api/playlists/${publicPlaylistId}`);
      assert.equal(checkRes.status, 404);
    });
  });

  // ==========================================
  // 4. LISTENING HISTORY & PRIVACY TESTS
  // ==========================================
  describe('Listening History & Privacy', () => {
    test('21. Validated play event logs listening history for authenticated user', async () => {
      const playRes = await request(app)
        .post(`/api/songs/${song1._id}/play`)
        .set('Cookie', listener1Cookie)
        .send({
          listenDuration: 45,
          sessionId: `sess_hist_${timestamp}`,
        });

      assert.equal(playRes.status, 200);

      const histRes = await request(app)
        .get('/api/users/me/history')
        .set('Cookie', listener1Cookie);

      assert.equal(histRes.status, 200);
      assert.equal(histRes.body.success, true);
      assert.ok(histRes.body.history.length >= 1);
      assert.equal(histRes.body.history[0].song._id.toString(), song1._id.toString());
    });

    test('22. History is strictly private to owner (Listener 2 sees empty history)', async () => {
      const res = await request(app)
        .get('/api/users/me/history')
        .set('Cookie', listener2Cookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.history.length, 0);
    });

    test('23. Clear listening history empties history list', async () => {
      const delRes = await request(app)
        .delete('/api/users/me/history')
        .set('Cookie', listener1Cookie);

      assert.equal(delRes.status, 200);

      const histRes = await request(app)
        .get('/api/users/me/history')
        .set('Cookie', listener1Cookie);

      assert.equal(histRes.body.history.length, 0);
    });
  });

  // ==========================================
  // 5. PERSONALIZED DISCOVERY & FALLBACK TESTS
  // ==========================================
  describe('Rule-Based Personalized Discovery & Fallback', () => {
    test('24. Fallback discovery returns popular songs for new/unauthenticated users', async () => {
      const resGuest = await request(app).get('/api/songs/discovery/personalized');
      assert.equal(resGuest.status, 200);
      assert.equal(resGuest.body.strategy, 'fallback_popular');
      assert.ok(resGuest.body.songs.length > 0);

      // Listener 2 (no follows, no history) gets fallback_new_user
      const resNew = await request(app)
        .get('/api/songs/discovery/personalized')
        .set('Cookie', listener2Cookie);
      assert.equal(resNew.status, 200);
      assert.equal(resNew.body.strategy, 'fallback_new_user');
      assert.ok(resNew.body.songs.length > 0);
    });

    test('25. Personalized discovery recommends tracks with rule-based scoring', async () => {
      // Have Listener 2 follow Artist P3
      await request(app)
        .post(`/api/users/${artistUser._id}/follow`)
        .set('Cookie', listener2Cookie);

      const res = await request(app)
        .get('/api/songs/discovery/personalized')
        .set('Cookie', listener2Cookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.strategy, 'rule_based_personalized');
      assert.ok(res.body.songs.length > 0);
      assert.equal(res.body.signals.followedArtistsCount, 1);
    });
  });
});
