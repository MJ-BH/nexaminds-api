const amqp = require('amqplib');
const nodemailer = require('nodemailer');
require('dotenv').config();

const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
const QUEUE = 'email_queue';

const startWorker = async () => {
    try {
        // Setup Email (Ethereal for testing)
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });

        // Connect Queue
        const conn = await amqp.connect(RABBIT_URL);
        const channel = await conn.createChannel();
        await channel.assertQueue(QUEUE);

        console.log("📧 Email Worker Listening...");

        channel.consume(QUEUE, async (msg) => {
            if (msg) {
                const { email, name, url } = JSON.parse(msg.content.toString());
                console.log(`Sending email to ${email}...`);

                try {
                    const info = await transporter.sendMail({
                        from: '"Nexaminds" <test@nexaminds.com>',
                        to: email,
                        subject: "Your URL is ready",
                        text: `Hi ${name}, your URL: ${url}`
                    });
                    
                    console.log("Sent! Preview:", nodemailer.getTestMessageUrl(info));
                    channel.ack(msg); // Criteria: Reliability (Ack only on success)
                } catch (e) {
                    console.error("Email failed", e);
                    channel.nack(msg); // Requeue logic
                }
            }
        });
    } catch (err) {
        console.error("Connection failed, retrying...", err);
        setTimeout(startWorker, 5000);
    }
};

startWorker();