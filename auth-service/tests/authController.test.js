const request = require('supertest');
const express = require('express');
const authController = require('../src/controllers/authController');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- MOCKS ---
jest.mock('../src/models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Setup App
const app = express();
app.use(express.json());
app.post('/register', authController.register);
app.post('/login', authController.login);
app.patch('/internal/update-url', authController.updateUserUrl);

describe('Auth Service Unit Tests', () => {
    
    afterEach(() => jest.clearAllMocks());

    // --- REGISTER ---
    it('POST /register - should create user and return token', async () => {
        User.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('hashed_pw');
        User.create.mockResolvedValue({ _id: '123', email: 'test@test.com' });
        jwt.sign.mockReturnValue('test_token');

        const res = await request(app).post('/register').send({
            fullname: 'John Doe', email: 'test@test.com', password: '123'
        });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token', 'test_token');
    });

    it('POST /register - should fail on invalid email', async () => {
        const res = await request(app).post('/register').send({
            fullname: 'John', email: 'bad-email', password: '123'
        });
        expect(res.statusCode).toBe(400);
        expect(User.create).not.toHaveBeenCalled();
    });

    // --- LOGIN ---
    it('POST /login - should return token on success', async () => {
        const mockUser = { _id: '123', email: 'test@test.com', password: 'hashed_pw' };
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('test_token');

        const res = await request(app).post('/login').send({
            email: 'test@test.com', password: '123'
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token', 'test_token');
    });

    // --- INTERNAL UPDATE ---
    it('PATCH /internal/update-url - should update user URL', async () => {
        User.findOneAndUpdate.mockResolvedValue({
            email: 'test@test.com', fullname: 'John Doe', generatedUrl: 'http://new-url'
        });

        const res = await request(app).patch('/internal/update-url').send({
            name: 'John Doe', url: 'http://new-url'
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('email', 'test@test.com');
    });
});