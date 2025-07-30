import request from 'supertest';
import { startServer, closeServer } from './testSetup.js';

describe('Authentication API', () => {
  let server;

  beforeAll(() => {
    server = startServer(4000);
  });

  afterAll((done) => {
    closeServer(done);
  });

  test('POST /api/auth/login - success', async () => {
    const response = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'admin@sekolah.com',
        password: 'admin123',
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data.token');
  });

  test('POST /api/auth/login - failure with wrong credentials', async () => {
    const response = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'admin@sekolah.com',
        password: 'wrongpassword',
      });
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });

  test('POST /api/auth/login - failure with missing email', async () => {
    const response = await request(server)
      .post('/api/auth/login')
      .send({
        password: 'admin123',
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });

  test('POST /api/auth/login - failure with invalid email format', async () => {
    const response = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'invalidemail',
        password: 'admin123',
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });

  test('POST /api/auth/login - failure with missing password', async () => {
    const response = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'admin@sekolah.com',
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });

  test('GET /api/auth/profile - failure without token', async () => {
    const response = await request(server).get('/api/auth/profile');
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });

  test('GET /api/auth/profile - failure with invalid token', async () => {
    const response = await request(server)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalidtoken');
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });
});
