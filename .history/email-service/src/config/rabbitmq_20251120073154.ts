import client, { Connection, Channel } from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
export const QUEUE_NAME = 'email_queue';

// We store the channel globally to reuse it
let channel: Channel | null = null;
let connection: Connection | null = null;

export const connectRabbitMQ = async (): Promise<Channel | null> => {
    try {
        console.log(`⌛ Connecting to RabbitMQ at ${RABBITMQ_URL}...`);

        // 1. Create Connection
        // We do NOT manually type this variable. We let TS infer it from the library.
        connection = await client.connect(RABBITMQ_URL);

        // 2. Create Channel
        // We let TS infer this too.
        channel = await connection.createChannel();

        // 3. Setup Queue
        await channel.assertQueue(QUEUE_NAME, {
            durable: true 
        });

        console.log('✅ RabbitMQ Connected');
        return channel;

    } catch (error) {
        console.error('❌ RabbitMQ Connection Error:', (error as Error).message);
        console.log("Retrying in 5 seconds...");
        
        // Retry Logic
        return new Promise((resolve) => {
            setTimeout(async () => {
                // Recursively call connect
                const retryChannel = await connectRabbitMQ();
                resolve(retryChannel);
            }, 5000);
        });
    }
};

export const getChannel = (): Channel | null => channel;

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