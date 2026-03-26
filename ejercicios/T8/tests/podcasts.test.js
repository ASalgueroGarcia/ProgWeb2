// tests/podcasts.test.js
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import dbConnect from '../src/config/db.js';
import User from '../src/models/user.model.js';

let userToken = '';
let adminToken = '';
let podcastId = '';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await dbConnect();

  // Create regular user and get token
  const userRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Regular User',
      email: `user_${Date.now()}@example.com`,
      password: 'TestPassword123'
    });
  userToken = userRes.body.token;

  // Create admin user and get token
  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Admin User',
      email: `admin_${Date.now()}@example.com`,
      password: 'TestPassword123'
    });
  adminToken = adminRes.body.token;

  // Manually set admin role in DB
  await User.findByIdAndUpdate(adminRes.body.user._id, { role: 'admin' });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Podcasts Endpoints', () => {
  describe('GET /api/podcasts', () => {
    it('debería devolver array de podcasts publicados → 200', async () => {
      const res = await request(app)
        .get('/api/podcasts')
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/podcasts', () => {
    it('debería crear un podcast → 201', async () => {
      const res = await request(app)
        .post('/api/podcasts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Mi Podcast de Test',
          description: 'Descripción larga del podcast de test',
          category: 'tech',
          duration: 3600,
          episodes: 5
        })
        .expect(201);

      expect(res.body.data).toHaveProperty('title', 'Mi Podcast de Test');
      podcastId = res.body.data._id;
    });

    it('debería rechazar sin token → 401', async () => {
      await request(app)
        .post('/api/podcasts')
        .send({
          title: 'Sin Auth',
          description: 'Descripción sin autenticación',
          duration: 3600
        })
        .expect(401);
    });
  });

  describe('DELETE /api/podcasts/:id', () => {
    it('debería rechazar para user normal → 403', async () => {
      await request(app)
        .delete(`/api/podcasts/${podcastId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('debería eliminar para admin → 200', async () => {
      await request(app)
        .delete(`/api/podcasts/${podcastId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('GET /api/podcasts/admin/all', () => {
    it('debería devolver todos los podcasts para admin → 200', async () => {
      const res = await request(app)
        .get('/api/podcasts/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('debería rechazar para user normal → 403', async () => {
      await request(app)
        .get('/api/podcasts/admin/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});