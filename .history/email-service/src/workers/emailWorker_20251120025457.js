const nodemailer = require('nodemailer');
const { getChannel, QUEUE_NAME } = require('../config/rabbitmq');
const createTransporter = require('../config/transporter');
const renderTemplate = require('../templates/emailTemplate');

const startWorker = async () => {
    const channel = getChannel();
    if (!channel) {
        setTimeout(startWorker, 1000); // Wait for connection
        return;
    }

    const transporter = await createTransporter();
    console.log("📧 Worker Listening for messages...");

    channel.consume(QUEUE_NAME, async (msg) => {
        if (msg !== null) {
            const content = JSON.parse(msg.content.toString());
            console.log(`📨 Processing job for: ${content.email}`);

            try {
                const htmlContent = renderTemplate(content.name, content.url);

                const info = await transporter.sendMail({
                    from: '"Nexaminds" <no-reply@nexaminds.com>',
                    to: content.email,
                    subject: "Your Generated URL",
                    text: `Hello ${content.name}, your URL is: ${content.url}`,
                    html: htmlContent
                });

                console.log("✅ Sent: %s", nodemailer.getTestMessageUrl(info));
                channel.ack(msg); // Acknowledge success

            } catch (error) {
                console.error("❌ Error sending email:", error.message);
                // Simple Retry Logic: NACK and requeue
                // In production, implement the retry counter logic we discussed earlier
                channel.nack(msg); 
            }
        }
    });
};

module.exports = startWorker;