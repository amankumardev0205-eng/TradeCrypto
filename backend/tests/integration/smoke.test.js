const request = require('supertest');
const app = require('../../server');

describe('Backend Supertest Smoke Test', () => {
  it('GET /api/health returns 200 OK and status ok payload', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('database', 'Firestore');
  });

  it('GET /api/non-existent-route returns 404 Not Found', async () => {
    const res = await request(app).get('/api/non-existent-route');
    expect(res.statusCode).toBe(404);
  });
});
