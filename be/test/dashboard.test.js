import request from 'supertest';
import { startServer, closeServer } from './testSetup.js';

describe('Dashboard API', () => {
  let server;

  beforeAll(() => {
    server = startServer(4005);
  });

  afterAll((done) => {
    closeServer(done);
  });

  test('GET /api/dashboard/stats - should return dashboard statistics', async () => {
    const response = await request(server).get('/api/dashboard/stats');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });

  test('GET /api/dashboard/charts - should return chart data', async () => {
    const response = await request(server).get('/api/dashboard/charts');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });

  test('GET /api/dashboard/quick-stats - should return quick statistics', async () => {
    const response = await request(server).get('/api/dashboard/quick-stats');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });

  test('GET /api/dashboard/stats - failure with invalid query param', async () => {
    const response = await request(server).get('/api/dashboard/stats?invalidParam=true');
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });
});
