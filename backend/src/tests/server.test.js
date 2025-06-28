const request = require('supertest');
const app = require('../server');

describe('BookHub Backend', () => {
  describe('GET /health', () => {
    it('should return 200 and health status', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.body.status).toBe('OK');
      expect(res.body.message).toBe('BookHub Backend is running');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('GET /api', () => {
    it('should return API information', async () => {
      const res = await request(app)
        .get('/api')
        .expect(200);

      expect(res.body.message).toBe('BookHub API');
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(res.body.error).toBe('Route not found');
    });
  });
});