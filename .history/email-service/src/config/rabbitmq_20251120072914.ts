import amqp, { Connection, Channel } from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
export const QUEUE_NAME = 'email_queue';

// Global variable types
let connection: Connection | null = null;
let channel: Channel | null = null;

export const connectRabbitMQ = async (): Promise<Channel | null> => {
    try {
        console.log(`⌛ Connecting to RabbitMQ at ${RABBITMQ_URL}...`);

        // 1. Create Connection (TCP)
        // We explicitly call amqp.connect
        connection = await amqp.connect(RABBITMQ_URL);

        // 2. Create Channel (Virtual)
        // We assume 'connection' is valid here
        channel = await connection.createChannel();

        // 3. Assert Queue
        await channel.assertQueue(QUEUE_NAME, {
            durable: true 
        });

        console.log('✅ RabbitMQ Connected');
        return channel;

    } catch (error) {
        console.error('❌ RabbitMQ Connection Error:', (error as Error).message);
        console.log("Retrying in 5 seconds...");
        
        // Retry Logic (Recursive)
        return new Promise((resolve) => {
            setTimeout(async () => {
                const retryChannel = await connectRabbitMQ();
                resolve(retryChannel);
            }, 5000);
        });
    }
};

// Getter to access the channel safely
export const getChannel = (): Channel | null => channel;

// Helper function to send messages
export const sendToQueue = (data: object): boolean => {
    if (!channel) {
        console.error("❌ RabbitMQ channel is not initialized.");
        return false;
    }
    
    return channel.sendToQueue(
        QUEUE_NAME, 
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
    );
};