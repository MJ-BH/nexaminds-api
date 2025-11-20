"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const rabbitmq_1 = require("../config/rabbitmq");
const transporter_1 = __importDefault(require("../config/transporter"));
const emailTemplate_1 = __importDefault(require("../templates/emailTemplate"));
const MAX_RETRIES = 3;
const startWorker = async () => {
    const channel = (0, rabbitmq_1.getChannel)();
    if (!channel) {
        console.log("⏳ Worker waiting for RabbitMQ...");
        setTimeout(startWorker, 1000);
        return;
    }
    const transporter = await (0, transporter_1.default)();
    console.log("📧 Worker Listening for messages...");
    channel.consume(rabbitmq_1.QUEUE_NAME, async (msg) => {
        if (msg !== null) {
            // Parse content with Type
            const content = JSON.parse(msg.content.toString());
            const currentRetries = content.retryCount || 0;
            console.log(`📨 Processing: ${content.email} (Attempt: ${currentRetries + 1})`);
            try {
                const htmlContent = (0, emailTemplate_1.default)(content.name, content.url);
                const info = await transporter.sendMail({
                    from: '"Nexaminds" <no-reply@nexaminds.com>',
                    to: content.email,
                    subject: "Your Generated URL",
                    html: htmlContent
                });
                console.log("✅ Sent: %s", info.messageId);
                console.log("🔗 Preview URL: %s", nodemailer_1.default.getTestMessageUrl(info));
                channel.ack(msg);
            }
            catch (error) {
                console.error(`❌ Failed: ${error.message}`);
                // Retry Logic
                if (currentRetries < MAX_RETRIES) {
                    content.retryCount = currentRetries + 1;
                    channel.sendToQueue(rabbitmq_1.QUEUE_NAME, Buffer.from(JSON.stringify(content)));
                    channel.ack(msg);
                }
                else {
                    console.error(`💀 Max retries reached. Dropping.`);
                    channel.ack(msg);
                }
            }
        }
    });
};
exports.default = startWorker;
