const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const urlRoutes = require('./routes/urlRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());

// Swagger
const swaggerOptions = {
    definition: { openapi: '3.0.0', info: { title: 'URL Builder API', version: '1.0.0' } },
    apis: ['./src/routes/*.js'],
};
const specs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/', urlRoutes);
app.get('/swagger.json', (req, res) => res.json(specs));

const PORT = 3002;
app.listen(PORT, () => console.log(`URL Builder running on ${PORT}`));