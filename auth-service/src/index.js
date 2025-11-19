const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();

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
app.use('/api/v1/auth', authRoutes);


app.get('/swagger.json', (req, res) => res.json(specs));
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));

module.exports = app; // Export for testing