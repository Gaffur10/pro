import request from 'supertest';
import { startServer, closeServer } from './testSetup.js';

describe('Clustering API', () => {
  let server;

  beforeAll(() => {
    server = startServer(4003);
  });

  afterAll((done) => {
    closeServer(done);
  });

  test('POST /api/clustering/run - should run clustering algorithm', async () => {
    const clusteringData = {
      algoritma: 'kmeans',
      jumlah_cluster: 3,
      semester: 'Ganjil 2024'
    };
    const response = await request(server)
      .post('/api/clustering/run')
      .send(clusteringData);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });

  test('POST /api/clustering/run - failure with missing algoritma', async () => {
    const invalidData = {
      jumlah_cluster: 3,
      semester: 'Ganjil 2024'
    };
    const response = await request(server)
      .post('/api/clustering/run')
      .send(invalidData);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });

  test('GET /api/clustering/results - should get clustering results', async () => {
    const response = await request(server).get('/api/clustering/results');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('GET /api/clustering/stats - should get clustering stats', async () => {
    const response = await request(server).get('/api/clustering/stats');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });

  test('DELETE /api/clustering/clear - should clear clustering results', async () => {
    const response = await request(server).delete('/api/clustering/clear');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});
