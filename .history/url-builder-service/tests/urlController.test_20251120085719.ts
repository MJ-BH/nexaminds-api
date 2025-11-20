import request from 'supertest';
import app from '../src/index';
import axios from 'axios';

// --- MOCKS ---
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// 👇 Helper to create a valid Axios Response object for TypeScript
const createAxiosResponse = (data: any, status = 200) => ({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {} as any,
});

describe('URL Builder Service Unit Tests', () => {
    
    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- HAPPY PATH ---
    it('should calculate logic and call APIs', async () => {
        // ✅ Fix: Use the helper to provide full response structure
        mockedAxios.patch.mockResolvedValue(createAxiosResponse({ email: 'alice@test.com' }));
        mockedAxios.post.mockResolvedValue(createAxiosResponse({ status: 'Processing' }, 202));

        const res = await request(app).post('/buildUrl').send({
            name: 'Alice', timestamps: [10, 30, 20]
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.generatedUrl).toContain('duration=0h0min20s');
        expect(res.body.generatedUrl).toContain('median=0h0min10s');
    });

    // --- ROBUSTNESS ---
    it('should ignore strings and bad data', async () => {
        mockedAxios.patch.mockResolvedValue(createAxiosResponse({ email: 'alice@test.com' }));
        // We can assume email service is ignored/successful here
        mockedAxios.post.mockResolvedValue(createAxiosResponse({}, 202));
        
        const res = await request(app).post('/buildUrl').send({
            name: 'Alice', timestamps: [10, "garbage", null, 30, 20]
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.generatedUrl).toContain('duration=0h0min20s');
    });

    // --- ERROR HANDLING ---
    it('should return 404 if User not found in Auth Service', async () => {
        // ✅ Fix: Mock the Rejection structure
        const errorResponse = {
            response: createAxiosResponse('User not found', 404),
            message: 'Request failed'
        };
        
        // We cast to 'any' because AxiosError structure is complex to mock fully manually
        mockedAxios.patch.mockRejectedValue(errorResponse as any);

        const res = await request(app).post('/buildUrl').send({
            name: 'Unknown', timestamps: [10, 20]
        });

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toContain('User not found');
    });
});