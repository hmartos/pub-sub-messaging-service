const request = require('supertest');
const app = require('../src/app');

describe('REST API Status', () => {
    it('should get the public API status', async () => {
        const res = await request(app).get('/status');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('timestamp');
    });
});
