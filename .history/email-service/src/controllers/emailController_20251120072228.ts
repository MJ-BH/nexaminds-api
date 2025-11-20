import { Request, Response } from 'express';
import { sendToQueue } from '../config/rabbitmq';

export const sendEmail = async (req: Request, res: Response) => {
    try {
        const { email, name, url } = req.body;

        if (!email || !name || !url) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            sendToQueue({ email, name, url });
        } catch (err) {
            return res.status(503).json({ error: 'Queue service unavailable' });
        }

        res.status(202).json({ 
            message: 'Email request queued', 
            status: 'Processing' 
        });

    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};