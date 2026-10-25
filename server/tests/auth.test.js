import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

describe('SunteRaho Authentication & Profile API Tests', () => {
  const testUserTimestamp = Date.now();
  const testListener = {
    name: 'Test Listener',
    username: `listener_${testUserTimestamp}`,
    email: `listener_${testUserTimestamp}@sunteraho.test`,
    password: 'password123',
    role: 'listener',
  };

  const testArtist = {
    name: 'Arijit Beats',
    username: `artist_${testUserTimestamp}`,
    email: `artist_${testUserTimestamp}@sunteraho.test`,
    password: 'secureArtistPass99',
    role: 'artist',
    stageName: 'Arijit The Producer',
    genres: ['Bollywood', 'Lo-Fi', 'Pop'],
  };

  let listenerCookie = '';
  let artistCookie = '';

  before(async () => {
    let uri = process.env.db_url || process.env.dbURL || process.env.MONGO_URI;
    if (uri && uri.includes('.mongodb.net/') && !uri.includes('.mongodb.net/sunteraho')) {
      uri = uri.replace('.mongodb.net/', '.mongodb.net/sunteraho?retryWrites=true&w=majority');
    }
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
  });

  after(async () => {
    // Clean up created test accounts
    await User.deleteMany({
      email: { $in: [testListener.email, testArtist.email] },
    });
    await mongoose.disconnect();
  });

  test('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
  });

  test('POST /api/auth/register should fail when required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Incomplete User',
      email: 'incomplete@test.com',
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('POST /api/auth/register should fail when password is less than 6 chars', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Short Password',
      username: `short_${testUserTimestamp}`,
      email: `short_${testUserTimestamp}@test.com`,
      password: '123',
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('POST /api/auth/register should successfully register a Listener and set auth cookie', async () => {
    const res = await request(app).post('/api/auth/register').send(testListener);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.role, 'listener');
    assert.equal(res.body.user.username, testListener.username);
    assert.equal(res.body.user.email, testListener.email);
    assert.equal(res.body.user.password, undefined, 'Password should never be exposed in response');

    // Verify Set-Cookie header exists
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies, 'set-cookie header should be present');
    const tokenCookie = cookies.find((c) => c.startsWith('token='));
    assert.ok(tokenCookie, 'token cookie should be set');
    listenerCookie = tokenCookie.split(';')[0];
  });

  test('POST /api/auth/register should fail on duplicate email or username', async () => {
    const res = await request(app).post('/api/auth/register').send(testListener);
    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
  });

  test('POST /api/auth/register should successfully register an Artist with artistProfile', async () => {
    const res = await request(app).post('/api/auth/register').send(testArtist);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.role, 'artist');
    assert.equal(res.body.user.artistProfile.stageName, testArtist.stageName);
    assert.deepEqual(res.body.user.artistProfile.genres, testArtist.genres);

    const cookies = res.headers['set-cookie'];
    const tokenCookie = cookies.find((c) => c.startsWith('token='));
    assert.ok(tokenCookie);
    artistCookie = tokenCookie.split(';')[0];
  });

  test('POST /api/auth/login should fail with invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      loginId: testListener.email,
      password: 'wrong_password_xyz',
    });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('POST /api/auth/login should succeed with valid credentials and return user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      loginId: testListener.username,
      password: testListener.password,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.email, testListener.email);
  });

  test('GET /api/auth/me should reject unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('GET /api/auth/me should return current user when authenticated via cookie', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', listenerCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.email, testListener.email);
  });

  test('PUT /api/users/profile should update user profile', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Cookie', listenerCookie)
      .send({
        name: 'Updated Listener Name',
        bio: 'Music enthusiast and playlist curator',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.name, 'Updated Listener Name');
    assert.equal(res.body.user.bio, 'Music enthusiast and playlist curator');
  });

  test('PUT /api/users/profile should update artist profile details for artist', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Cookie', artistCookie)
      .send({
        artistProfile: {
          stageName: 'Arijit World',
          genres: ['Indie', 'Acoustic', 'Folk'],
          socialLinks: {
            instagram: 'https://instagram.com/arijitworld',
            youtube: 'https://youtube.com/@arijitworld',
          },
        },
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.artistProfile.stageName, 'Arijit World');
    assert.equal(res.body.user.artistProfile.socialLinks.instagram, 'https://instagram.com/arijitworld');
  });

  test('GET /api/users/artists should list artists', async () => {
    const res = await request(app).get('/api/users/artists');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.artists));
    const foundArtist = res.body.artists.find((a) => a.username === testArtist.username);
    assert.ok(foundArtist, 'Created test artist should appear in artist list');
  });

  test('POST /api/auth/logout should clear the token cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const cookies = res.headers['set-cookie'];
    assert.ok(cookies);
    const tokenCookie = cookies.find((c) => c.startsWith('token='));
    assert.ok(tokenCookie);
    // Expiration date or empty value indicates cookie clearance
    assert.ok(tokenCookie.includes('Max-Age=0') || tokenCookie.includes('Expires=Thu, 01 Jan 1970'));
  });
});
