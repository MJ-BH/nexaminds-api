import request from 'supertest';
import app from '../src/index'; // Ensure src/index.ts has 'export default app'
import User from '../src/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// --- MOCKS ---
jest.mock('../src/models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Service Unit Tests', () => {
    
    // --- REGISTER ---
    it('POST /register - should create user and return token', async () => {
        // Mock Mongoose findOne (User does not exist)
        (User.findOne as jest.Mock).mockResolvedValue(null);
        // Mock Bcrypt
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
        // Mock Create
        (User.create as jest.Mock).mockResolvedValue({ 
            _id: '123', 
            email: 'test@test.com',
            toObject: () => ({ _id: '123' }) // Mongoose compatibility
        });
        // Mock JWT
        (jwt.sign as jest.Mock).mockReturnValue('test_token');

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
        const mockUser = { 
            _id: '123', 
            email: 'test@test.com', 
            password: 'hashed_pw' 
        };
        
        (User.findOne as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwt.sign as jest.Mock).mockReturnValue('test_token');

        const res = await request(app).post('/login').send({
            email: 'test@test.com', password: '123'
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token', 'test_token');
    });
});