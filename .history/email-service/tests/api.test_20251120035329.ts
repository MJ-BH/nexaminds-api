const request = require('supertest');
const express = require('express');
const emailController = require('../src/controllers/emailController');

// --- MOCK RABBITMQ CONFIG ---
jest.mock('../src/config/rabbitmq', () => ({
    sendToQueue: jest.fn()
}));


const { sendToQueue } = require('../src/config/rabbitmq');

const app = express();
app.use(express.json());
app.post('/send', emailController.sendEmail);

describe('Email Service API Tests', () => {
    afterEach(() => jest.clearAllMocks());

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
        sendToQueue.mockImplementation(() => { throw new Error("Queue Down"); });
        
        const res = await request(app).post('/send').send({
            email: 't@t.com', name: 'T', url: 'u'
        });

        expect(res.statusCode).toBe(503);
    });
});