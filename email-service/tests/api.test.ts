import request from 'supertest';
import app from '../src/index';
import { sendToQueue } from '../src/config/rabbitmq';

// --- MOCK RABBITMQ CONFIG ---
jest.mock('../src/config/rabbitmq', () => ({
    connectRabbitMQ: jest.fn(), // Mock connection used in index.ts
    sendToQueue: jest.fn()
}));

// We also need to mock the worker start to prevent it from running during API tests
jest.mock('../src/workers/emailWorker', () => jest.fn());

describe('Email Service API Tests', () => {

    it('POST /send - should push to queue', async () => {
        const res = await request(app).post('/send').send({
            email: 'test@test.com', name: 'Test', url: 'http://url'
        });

        expect(res.statusCode).toBe(202);
        expect(sendToQueue).toHaveBeenCalledWith({
            email: 'test@test.com', name: 'Test', url: 'http://url'
        });
    });

    it('POST /send - should return 503 if Queue fails', async () => {
        (sendToQueue as jest.Mock).mockImplementation(() => { throw new Error("Queue Down"); });
        
        const res = await request(app).post('/send').send({
            email: 't@t.com', name: 'T', url: 'u'
        });

        expect(res.statusCode).toBe(503);
    });
});