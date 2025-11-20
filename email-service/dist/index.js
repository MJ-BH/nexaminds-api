"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const dotenv_1 = __importDefault(require("dotenv"));
const rabbitmq_1 = require("./config/rabbitmq");
const emailWorker_1 = __importDefault(require("./workers/emailWorker"));
const emailRoutes_1 = __importDefault(require("./routes/emailRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 3003;
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Swagger
const swaggerOptions = {
    definition: { openapi: '3.0.0', info: { title: 'Email Service API', version: '1.0.0' } },
    apis: ['./src/routes/*.ts', './dist/routes/*.js'], // Support TS and JS (dist)
};
const specs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
app.get('/swagger.json', (req, res) => {
    res.json(specs);
});
// Routes
app.use('/', emailRoutes_1.default);
// Start
const startServer = async () => {
    await (0, rabbitmq_1.connectRabbitMQ)();
    (0, emailWorker_1.default)();
    app.listen(PORT, () => {
        console.log(`🚀 Email Service running on port ${PORT}`);
    });
};
startServer();
exports.default = app;
