import amqp, { Channel } from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
export const QUEUE_NAME = 'email_queue';

// We keep 'channel' typed strictly because we use it in the app
let channel: Channel | null = null;

export const connectRabbitMQ = async (): Promise<Channel | null> => {
    try {
        console.log(`⌛ Connecting to RabbitMQ at ${RABBITMQ_URL}...`);

        // 👇 FIX: We treat connection as 'any' to bypass the library type mismatch
        const connection: any = await amqp.connect(RABBITMQ_URL);

        // Create Channel
        channel = await connection.createChannel();

        // Assert Queue
        if (channel) {
            await channel.assertQueue(QUEUE_NAME, {
                durable: true 
            });
        }

        console.log('✅ RabbitMQ Connected');
        return channel;

    } catch (error) {
        console.error('❌ RabbitMQ Connection Error:', (error as Error).message);
        console.log("Retrying in 5 seconds...");
        
        return new Promise((resolve) => {
            setTimeout(async () => {
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