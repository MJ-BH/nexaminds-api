"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const rabbitmq_1 = require("../config/rabbitmq");
const sendEmail = async (req, res) => {
    try {
        const { email, name, url } = req.body;
        if (!email || !name || !url) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        try {
            (0, rabbitmq_1.sendToQueue)({ email, name, url });
        }
        catch (err) {
            return res.status(503).json({ error: 'Queue service unavailable' });
        }
        res.status(202).json({
            message: 'Email request queued',
            status: 'Processing'
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.sendEmail = sendEmail;
