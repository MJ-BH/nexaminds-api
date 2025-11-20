
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
require('dotenv').config();

import express, { Application } from 'express';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import cors from 'cors';

const app = express();

// 👇 ADD THIS DEBUG BLOCK 👇
app.use((req, res, next) => {
    console.log(`🔍 DEBUG: Auth Service received ${req.method} request at: ${req.url}`);
    console.log(`   - Original URL: ${req.originalUrl}`);
    next();
});
// 👆 END DEBUG BLOCK 👆
// Middleware
app.use(express.json());
app.use(cors());

// Database
connectDB();

// Swagger Config
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'Auth Service API', version: '1.0.0' },
    },
    apis: ['./src/routes/*.js'],
};
const specs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Versioned Routes
app.use('/', authRoutes);


app.get('/swagger.json', (req, res) => res.json(specs));
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));

module.exports = app; // Export for testing