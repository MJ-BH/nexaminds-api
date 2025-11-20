const axios = require('axios');
const amqp = require('amqplib');

const AUTH_MS_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
const QUEUE = 'email_queue';

// 1. Duration Formatter
const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h${m}min${s}s`;
};

// 2. Median Logic 
const calculateMedian = (arr) => {
    if (arr.length === 0) return 0;
    arr.sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    
    if (arr.length % 2 !== 0) {
        return arr[mid];
    } else {
        // "Average of 2 middle values... if decimal, lower integer value"
        return Math.floor((arr[mid - 1] + arr[mid]) / 2);
    }
};

// 3. RabbitMQ Producer
let channel;
const connectQueue = async () => {
    try {
        const conn = await amqp.connect(RABBIT_URL);
        channel = await conn.createChannel();
        await channel.assertQueue(QUEUE);
    } catch (err) {
        console.log('RabbitMQ waiting...');
        setTimeout(connectQueue, 5000);
    }
};
connectQueue();

exports.buildUrl = async (req, res) => {
    try {
        const { name, timestamps } = req.body;

        // Validation
       if (!name || !timestamps || !Array.isArray(timestamps)) {
    return res.status(400).json({ error: 'Invalid input format. "timestamps" must be an array.' });
}
        
        // Filter only positive integers
        const validTimestamps = timestamps.filter(t => Number.isInteger(t) && t > 0);
        if (validTimestamps.length === 0) return res.status(400).json({ error: 'No valid timestamps' });

        // Logic
        validTimestamps.sort((a, b) => a - b);
        const oldest = validTimestamps[0];
        const newest = validTimestamps[validTimestamps.length - 1];
        
        const durationVal = newest - oldest;
        const medianVal = calculateMedian(validTimestamps) - oldest; // Duration relative to start? Or absolute value? 
        // PDF says: "median should be a label describing the duration between the oldest valid timestamp and the median valid timestamp."
        
        const url = `https://server/record?name=${name}&duration=${formatDuration(durationVal)}&median=${formatDuration(medianVal)}`;

        // Communication 1: Auth MS (Sync)
               let userEmail = "";
        try {
            const authResponse = await axios.patch(`${AUTH_MS_URL}/api/v1/auth/internal/update-url`, {
                name,
                url: generatedUrl
            });
            userEmail = authResponse.data.email;
        } catch (err) {
            // If Auth fails, we return immediately because we can't send an email anyway
            return res.status(404).json({ 
                error: 'User not found in Auth Service', 
                details: err.message 
            });
        }

        // 2. Try to Queue the Email (Improved Error Reporting)
        let emailStatus = "Not Queued";
        
        if (!channel) {
            emailStatus = "Failed: Queue Service Unavailable";
            console.error("⚠️ RabbitMQ channel is missing.");
        } else {
            try {
                const message = JSON.stringify({ email: userEmail, name, url: generatedUrl });
                const sent = channel.sendToQueue(QUEUE, Buffer.from(message));
                
                if (sent) {
                    emailStatus = "Queued Successfully";
                } else {
                    emailStatus = "Failed: Queue Buffer Full";
                }
            } catch (queueError) {
                emailStatus = `Failed: ${queueError.message}`;
                console.error("Queue Error:", queueError);
            }
        }

        // 3. Return Comprehensive Response
        res.json({ 
            message: "Calculation Complete",
            generatedUrl: generatedUrl,
            emailDispatch: {
                status: emailStatus,
                recipient: userEmail,
                note: "If status is 'Queued Successfully', the email will be sent in the background."
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};