import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import cors from 'cors';


// Load environment variables
dotenv.config();

// Initialize Express App with Type
const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
connectDB();

// --- SWAGGER CONFIGURATION ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { 
            title: 'Auth Service API', 
            version: '1.0.0',
            description: 'Authentication Microservice'
        },
        servers: [
            { url: 'http://localhost:3000/api/v1/auth', description: 'API Gateway' }
        ],
    },
    // Look for TS files in src OR JS files in dist (for production)
    apis: ['./src/routes/*.ts', './dist/routes/*.js'], 
};

const specs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Expose JSON for the API Gateway
app.get('/swagger.json', (req: Request, res: Response) => {
    res.json(specs);
});

// --- ROUTES ---
// We mount at root '/' because the API Gateway strips the '/api/v1/auth' prefix
app.use('/', authRoutes);

// --- GLOBAL ERROR HANDLER ---
app.use((err: Error, req: Request, res: Response, next: Function) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Auth Service running on port ${PORT}`);
});

export default app; // Export for testing