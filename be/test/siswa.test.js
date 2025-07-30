import request from 'supertest';
import { startServer, closeServer } from './testSetup.js';

describe('Siswa API', () => {
  let server;

  beforeAll(() => {
    server = startServer(4001);
  });

  afterAll((done) => {
    closeServer(done);
  });

  test('GET /api/siswa - should return list of siswa', async () => {
    const response = await request(server).get('/api/siswa');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('POST /api/siswa - should create new siswa', async () => {
    const newSiswa = {
      nis: '2024007',
      nama: 'Test Siswa',
      kelas: 'XII IPA 2',
      jenis_kelamin: 'L',
      tanggal_lahir: '2006-10-10',
      alamat: 'Jl. Test No. 1',
      telepon: '081234567890'
    };
    const response = await request(server)
      .post('/api/siswa')
      .send(newSiswa);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('nis', newSiswa.nis);
  });

  test('POST /api/siswa - failure with missing nis', async () => {
    const invalidSiswa = {
      nama: 'Test Siswa'
    };
    const response = await request(server)
      .post('/api/siswa')
      .send(invalidSiswa);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });

  test('GET /api/siswa/:id - should return siswa by id', async () => {
    const response = await request(server).get('/api/siswa/1');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('id', 1);
  });

  test('PUT /api/siswa/:id - should update siswa', async () => {
    const updateData = {
      nama: 'Updated Siswa'
    };
    const response = await request(server)
      .put('/api/siswa/1')
      .send(updateData);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });

  test('PUT /api/siswa/:id - failure updating non-existent siswa', async () => {
    const updateData = {
      nama: 'Updated Siswa'
    };
    const response = await request(server)
      .put('/api/siswa/9999')
      .send(updateData);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  });

  test('DELETE /api/siswa/:id - should delete siswa', async () => {
    const response = await request(server).delete('/api/siswa/1');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });

  test('DELETE /api/siswa/:id - failure deleting non-existent siswa', async () => {
    const response = await request(server).delete('/api/siswa/9999');
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  });
});
