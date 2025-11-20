const amqp = require('amqplib');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
const QUEUE_NAME = 'email_queue';

let channel = null;

const connectRabbitMQ = async () => {
    try {
        const conn = await amqp.connect(RABBITMQ_URL);
        channel = await conn.createChannel();
        await channel.assertQueue(QUEUE_NAME);
        console.log("✅ RabbitMQ Connected");
        return channel;
    } catch (error) {
        console.error("❌ RabbitMQ Connection Error:", error.message);
        console.log("Retrying in 5 seconds...");
        setTimeout(connectRabbitMQ, 5000);
    }
};

const getChannel = () => channel;

const sendToQueue = (data) => {
    if (!channel) throw new Error("RabbitMQ channel not initialized");
    return channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(data)));
};

module.exports = { connectRabbitMQ, getChannel, sendToQueue, QUEUE_NAME };