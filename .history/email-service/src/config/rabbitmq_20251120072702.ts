import amqp, { Channel, Connection } from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
export const QUEUE_NAME = 'email_queue';

// Global variable to hold the channel
let channel: Channel | null = null;

export const connectRabbitMQ = async (): Promise<Channel | null> => {
    try {
        // 1. Establish the TCP Connection
        // We explicitly type this as 'Connection'
        const connection: Connection = await amqp.connect(RABBITMQ_URL);

        // 2. Create the Channel
        // We explicitly type this as 'Channel'
        channel = await connection.createChannel();

        // 3. Setup Queue
        await channel.assertQueue(QUEUE_NAME, {
            durable: true // Good practice: keeps queue if RabbitMQ restarts
        });

        console.log('✅ RabbitMQ Connected');
        return channel;

    } catch (error) {
        console.error('❌ RabbitMQ Connection Error:', (error as Error).message);
        console.log("Retrying in 5 seconds...");
        
        // Retry logic
        return new Promise((resolve) => {
            setTimeout(async () => {
                const retryChannel = await connectRabbitMQ();
                resolve(retryChannel);
            }, 5000);
        });
    }
};

// Getter for the channel
export const getChannel = (): Channel | null => channel;

// Helper to publish messages
export const sendToQueue = (data: object): boolean => {
    if (!channel) {
        console.error("❌ Cannot send message: RabbitMQ channel not initialized");
        return false;
    }
    
    return channel.sendToQueue(
        QUEUE_NAME, 
        Buffer.from(JSON.stringify(data)), 
        { persistent: true } // Good practice: save message to disk
    );
};