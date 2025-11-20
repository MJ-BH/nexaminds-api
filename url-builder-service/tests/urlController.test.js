const request = require('supertest');
const express = require('express');
const urlController = require('../src/controllers/urlController');
const axios = require('axios');

// --- MOCKS ---
jest.mock('axios');

// Setup App
const app = express();
app.use(express.json());
app.post('/buildUrl', urlController.buildUrl);

describe('URL Builder Service Unit Tests', () => {
    
    afterEach(() => jest.clearAllMocks());

    // --- HAPPY PATH ---
    it('should calculate logic and call APIs', async () => {
        // Mock Auth API response
        axios.patch.mockResolvedValue({ data: { email: 'alice@test.com' } });
        // Mock Email API response
        axios.post.mockResolvedValue({ status: 202 });

        // Input: [10, 30, 20] -> Sorted [10, 20, 30]
        // Duration: 20s. Median: 10s.
        const res = await request(app).post('/buildUrl').send({
            name: 'Alice', timestamps: [10, 30, 20]
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.generatedUrl).toContain('duration=0h0min20s');
        expect(res.body.generatedUrl).toContain('median=0h0min10s');
        
        // Verify APIs were called
        expect(axios.patch).toHaveBeenCalled(); // Auth Called
        expect(axios.post).toHaveBeenCalled();  // Email Called
    });

    // --- ROBUSTNESS (String Filtering) ---
    it('should ignore strings and bad data', async () => {
        axios.patch.mockResolvedValue({ data: { email: 'alice@test.com' } });
        
        const res = await request(app).post('/buildUrl').send({
            name: 'Alice', timestamps: [10, "garbage", null, 30, 20]
        });

        expect(res.statusCode).toBe(200);
        // Should still calculate correctly for [10, 20, 30]
        expect(res.body.generatedUrl).toContain('duration=0h0min20s');
    });

    // --- ERROR HANDLING ---
    it('should return 404 if User not found in Auth Service', async () => {
        // Simulate Axios Error from Auth Service
        axios.patch.mockRejectedValue({ 
            response: { status: 404, data: 'User not found' } 
        });

        const res = await request(app).post('/buildUrl').send({
            name: 'Unknown', timestamps: [10, 20]
        });

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toContain('User not found');
    });
});