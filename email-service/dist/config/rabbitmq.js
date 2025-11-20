"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToQueue = exports.getChannel = exports.connectRabbitMQ = exports.QUEUE_NAME = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
exports.QUEUE_NAME = 'email_queue';
// We store the channel globally to reuse it
let channel = null;
let connection = null;
const connectRabbitMQ = async () => {
    try {
        console.log(`⌛ Connecting to RabbitMQ at ${RABBITMQ_URL}...`);
        // 1. Create Connection
        // We do NOT manually type this variable. We let TS infer it from the library.
        connection = await amqplib_1.default.connect(RABBITMQ_URL);
        // 2. Create Channel
        // We let TS infer this too.
        channel = await connection.createChannel();
        // 3. Setup Queue
        await channel.assertQueue(exports.QUEUE_NAME, {
            durable: true
        });
        console.log('✅ RabbitMQ Connected');
        return channel;
    }
    catch (error) {
        console.error('❌ RabbitMQ Connection Error:', error.message);
        console.log("Retrying in 5 seconds...");
        // Retry Logic
        return new Promise((resolve) => {
            setTimeout(async () => {
                // Recursively call connect
                const retryChannel = await (0, exports.connectRabbitMQ)();
                resolve(retryChannel);
            }, 5000);
        });
    }
};
exports.connectRabbitMQ = connectRabbitMQ;
const getChannel = () => channel;
exports.getChannel = getChannel;
const sendToQueue = (data) => {
    if (!channel) {
        console.error("❌ RabbitMQ channel is not initialized.");
        return false;
    }
    return channel.sendToQueue(exports.QUEUE_NAME, Buffer.from(JSON.stringify(data)), { persistent: true });
};
exports.sendToQueue = sendToQueue;
