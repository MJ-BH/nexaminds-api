import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper for JWT
const generateToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
};
const validateEmail = (email : string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};
// Register
exports.register = async (req : Request, res : Response) => {
    try {
        const { fullname, email, password } = req.body;
        
        // Validation
        if (!fullname || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
         if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format. Example: user@domain.com' });
        }


        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ fullname, email, password: hashedPassword });

        res.status(201).json({ 
            message: 'User registered successfully',
            token: generateToken(user.id)
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Login
exports.login = async (req : Request, res : Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password as string ))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({ 
            message: 'Login successful',
            token: generateToken(user.id) 
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Internal Endpoint for Microservice Communication
exports.updateUserUrl = async (req : Request, res : Response) => {
    try {
        const { name, url } = req.body;
        const user = await User.findOneAndUpdate(
            { fullname: name },
            { generatedUrl: url },
            { new: true }
        );
        
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        // Return email for the Email Service
        res.json({ email: user.email, fullname: user.fullname });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};