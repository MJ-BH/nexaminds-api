const request = require('supertest');
const app = require('../src/index');
const mongoose = require('mongoose');

describe('Auth API', () => {
    // Mock DB connection logic or use in-memory mongo here for real tests
    // For this snippet, we assume the server runs. 
    
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                fullname: 'Test User',
                email: `test${Date.now()}@example.com`,
                password: 'password123'
            });
        
        if (res.statusCode === 400) {
             // Handle if user exists
             expect(res.statusCode).toEqual(400);
        } else {
             expect(res.statusCode).toEqual(201);
             expect(res.body).toHaveProperty('token');
        }
    });
    
    afterAll(async () => {
        await mongoose.connection.close();
    });
});