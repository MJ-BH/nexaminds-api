const { sendToQueue } = require('../config/rabbitmq');

exports.sendEmail = async (req, res) => {
    try {
        const { email, name, url } = req.body;

        // 1. Validation
        if (!email || !name || !url) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // 2. Push to Queue
        try {
            sendToQueue({ email, name, url });
        } catch (err) {
            console
            return res.status(503).json({ error: 'Queue service unavailable' });
        }

        // 3. Respond Immediately
        res.status(202).json({ 
            message: 'Email request queued', 
            status: 'Processing' 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};