import amqp, { Channel, Connection } from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
export const QUEUE_NAME = 'email_queue';

let channel: Channel | null = null;

export const connectRabbitMQ = async (): Promise<Channel | null> => {
    try {
        const conn: Connection = await amqp.connect(RABBITMQ_URL);
        channel = await conn.createChannel();
        await channel.assertQueue(QUEUE_NAME);
        console.log('✅ RabbitMQ Connected');
        return channel;
    } catch (error) {
        console.error('❌ RabbitMQ Connection Error:', (error as Error).message);
        console.log("Retrying in 5 seconds...");
        setTimeout(connectRabbitMQ, 5000);
        return null;
    }
};

export const getChannel = (): Channel | null => channel;

export const sendToQueue = (data: object): boolean => {
    if (!channel) throw new Error("RabbitMQ channel not initialized");
    return channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(data)));
};