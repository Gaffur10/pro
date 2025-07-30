import request from 'supertest';
import { startServer, closeServer } from './testSetup.js';

describe('Nilai API', () => {
  let server;

  beforeAll(() => {
    server = startServer(4002);
  });

  afterAll((done) => {
    closeServer(done);
  });

  test('GET /api/nilai - should return list of nilai', async () => {
    const response = await request(server).get('/api/nilai');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('POST /api/nilai - should create new nilai', async () => {
    const newNilai = {
      siswa_id: 1,
      semester: 'Genap 2024',
      matematika: 90,
      fisika: 85,
      kimia: 88,
      biologi: 92,
      bahasa_indonesia: 87,
      bahasa_inggris: 89
    };
    const response = await request(server)
      .post('/api/nilai')
      .send(newNilai);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('semester', newNilai.semester);
  });

  test('POST /api/nilai - failure with missing siswa_id', async () => {
    const invalidNilai = {
      semester: 'Genap 2024',
      matematika: 90
    };
    const response = await request(server)
      .post('/api/nilai')
      .send(invalidNilai);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });

  test('GET /api/nilai/:id - should return nilai by id', async () => {
    const response = await request(server).get('/api/nilai/1');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('id', 1);
  });

  test('PUT /api/nilai/:id - should update nilai', async () => {
    const updateData = {
      matematika: 95
    };
    const response = await request(server)
      .put('/api/nilai/1')
      .send(updateData);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });

  test('PUT /api/nilai/:id - failure updating non-existent nilai', async () => {
    const updateData = {
      matematika: 95
    };
    const response = await request(server)
      .put('/api/nilai/9999')
      .send(updateData);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  });

  test('DELETE /api/nilai/:id - should delete nilai', async () => {
    const response = await request(server).delete('/api/nilai/1');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });

  test('DELETE /api/nilai/:id - failure deleting non-existent nilai', async () => {
    const response = await request(server).delete('/api/nilai/9999');
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  });
});
