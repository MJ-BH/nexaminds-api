const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { connectRabbitMQ } = require('./config/rabbitmq');
const startWorker = require('./workers/emailWorker');
const emailRoutes = require('./routes/emailRoutes');
require('dotenv').config();

const app = express();
const PORT = 3003;

// Middleware
app.use(express.json());
app.use(cors());

// Swagger Config
const swaggerOptions = {
    definition: { openapi: '3.0.0', info: { title: 'Email Service API', version: '1.0.0' } },
    apis: ['./src/routes/*.js'],
};
const specs = swaggerJsDoc(swaggerOptions);

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.get('/swagger.json', (req, res) => res.json(specs)); // For Gateway
app.use('/', emailRoutes); // Mounts /send

// Initialization
const startServer = async () => {
    // 1. Connect to RabbitMQ
    await connectRabbitMQ();
    
    // 2. Start the Background Worker
    startWorker();

    // 3. Start the REST API
    app.listen(PORT, () => {
        console.log(`🚀 Email Service running on port ${PORT}`);
    });
};

startServer();