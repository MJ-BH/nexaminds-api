import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import urlRoutes from './routes/urlRoutes';
import cors from 'cors';


dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// --- SWAGGER CONFIG ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'URL Builder API', version: '1.0.0' },
              servers: [
            // Point to the Gateway URL for Email
            { url: 'http://localhost:3000/api/v1/email', description: 'API Gateway' }
        ],
    },
    // Look for .ts files in src, OR .js files in dist (when built)
    apis: ['./src/routes/*.ts', './dist/routes/*.js'],
};
const specs = swaggerJsDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/swagger.json', (req: Request, res: Response) => {
    res.json(specs);
});

// --- ROUTES ---
// Gateway handles prefix /api/v1/tools
app.use('/', urlRoutes);

// --- ERROR HANDLER ---
app.use((err: Error, req: Request, res: Response, next: Function) => {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`URL Builder running on ${PORT}`));

export default app;