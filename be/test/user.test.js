import request from 'supertest';
import { startServer, closeServer } from './testSetup.js';

describe('User Management API', () => {
  let server;

  beforeAll(() => {
    server = startServer(4004);
  });

  afterAll((done) => {
    closeServer(done);
  });

  test('GET /api/users - should return list of users', async () => {
    const response = await request(server).get('/api/users');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('POST /api/users - should create new user', async () => {
    const newUser = {
      nama: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'teacher',
      status: 'active'
    };
    const response = await request(server)
      .post('/api/users')
      .send(newUser);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('email', newUser.email);
  });

  test('POST /api/users - failure with missing email', async () => {
    const invalidUser = {
      nama: 'Test User'
    };
    const response = await request(server)
      .post('/api/users')
      .send(invalidUser);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });

  test('GET /api/users/:id - should return user by id', async () => {
    const response = await request(server).get('/api/users/1');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('id', 1);
  });

  test('PUT /api/users/:id - should update user', async () => {
    const updateData = {
      nama: 'Updated User'
    };
    const response = await request(server)
      .put('/api/users/1')
      .send(updateData);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });

  test('PUT /api/users/:id - failure updating non-existent user', async () => {
    const updateData = {
      nama: 'Updated User'
    };
    const response = await request(server)
      .put('/api/users/9999')
      .send(updateData);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  });

  test('PUT /api/users/:id/password - should change user password', async () => {
    const passwordData = {
      newPassword: 'newpassword123'
    };
    const response = await request(server)
      .put('/api/users/1/password')
      .send(passwordData);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });

  test('PUT /api/users/:id/password - failure changing password for non-existent user', async () => {
    const passwordData = {
      newPassword: 'newpassword123'
    };
    const response = await request(server)
      .put('/api/users/9999/password')
      .send(passwordData);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  });

  test('DELETE /api/users/:id - should delete user', async () => {
    const response = await request(server).delete('/api/users/1');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });

  test('DELETE /api/users/:id - failure deleting non-existent user', async () => {
    const response = await request(server).delete('/api/users/9999');
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  });
});
