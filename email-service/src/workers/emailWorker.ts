import nodemailer from 'nodemailer';
import { getChannel, QUEUE_NAME } from '../config/rabbitmq';
import createTransporter from '../config/transporter';
import renderTemplate from '../templates/emailTemplate';

const MAX_RETRIES = 3;

// 👇 Define what the Queue Message looks like
interface EmailJob {
    email: string;
    name: string;
    url: string;
    retryCount?: number;
}

const startWorker = async (): Promise<void> => {
    const channel = getChannel();
    if (!channel) {
        console.log("⏳ Worker waiting for RabbitMQ...");
        setTimeout(startWorker, 1000);
        return;
    }

    const transporter = await createTransporter();
    console.log("📧 Worker Listening for messages...");

    channel.consume(QUEUE_NAME, async (msg) => {
        if (msg !== null) {
            // Parse content with Type
            const content: EmailJob = JSON.parse(msg.content.toString());
            const currentRetries = content.retryCount || 0;

            console.log(`📨 Processing: ${content.email} (Attempt: ${currentRetries + 1})`);

            try {
                const htmlContent = renderTemplate(content.name, content.url);

                const info = await transporter.sendMail({
                    from: '"Nexaminds" <no-reply@nexaminds.com>',
                    to: content.email,
                    subject: "Your Generated URL",
                    html: htmlContent
                });

                console.log("✅ Sent: %s", info.messageId);
                console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info));
                
                channel.ack(msg);

            } catch (error) {
                console.error(`❌ Failed: ${(error as Error).message}`);

                // Retry Logic
                if (currentRetries < MAX_RETRIES) {
                    content.retryCount = currentRetries + 1;
                    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(content)));
                    channel.ack(msg); 
                } else {
                    console.error(`💀 Max retries reached. Dropping.`);
                    channel.ack(msg);
                }
            }
        }
    });
};

export default startWorker;