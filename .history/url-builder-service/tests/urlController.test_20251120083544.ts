import request from 'supertest';
import app from '../src/index';
import axios from 'axios';

// --- MOCKS ---
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('URL Builder Service Unit Tests', () => {
    
    // --- HAPPY PATH ---
    it('should calculate logic and call APIs', async () => {
        // Mock Auth API response
        mockedAxios.patch.mockResolvedValue({ data: { email: 'alice@test.com' } });
        // Mock Email API response
        mockedAxios.post.mockResolvedValue({ status: 202 });

        const res = await request(app).post('/buildUrl').send({
            name: 'Alice', timestamps: [10, 30, 20]
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.generatedUrl).toContain('duration=0h0min20s');
        expect(res.body.generatedUrl).toContain('median=0h0min10s');
    });

    // --- ROBUSTNESS ---
    it('should ignore strings and bad data', async () => {
        mockedAxios.patch.mockResolvedValue({ data: { email: 'alice@test.com' } });
        
        const res = await request(app).post('/buildUrl').send({
            name: 'Alice', timestamps: [10, "garbage", null, 30, 20]
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.generatedUrl).toContain('duration=0h0min20s');
    });

    // --- ERROR HANDLING ---
    it('should return 404 if User not found in Auth Service', async () => {
        mockedAxios.patch.mockRejectedValue({ 
            response: { status: 404, data: 'User not found' } 
        });

        const res = await request(app).post('/buildUrl').send({
            name: 'Unknown', timestamps: [10, 20]
        });

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toContain('User not found');
    });
});