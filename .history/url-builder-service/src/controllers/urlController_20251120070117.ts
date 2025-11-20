import { Request, Response } from 'express'; 
import axios from 'axios';
// Configuration
const AUTH_MS_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const EMAIL_MS_URL = process.env.EMAIL_SERVICE_URL || 'http://email-service:3003';

// Helpers
const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h${m}min${s}s`;
};

const calculateMedian = (arr : number[]) => {
    if (arr.length === 0) return 0;
    arr.sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    if (arr.length % 2 !== 0) return arr[mid];
    return Math.floor((arr[mid - 1] + arr[mid]) / 2);
};

exports.buildUrl = async (req : Request, res : Response) => {
    try {
        const { name, timestamps } = req.body;

        // 1. Validation
        if (!name || !timestamps || !Array.isArray(timestamps)) {
            return res.status(400).json({ error: 'Invalid input format. "timestamps" must be an array.' });
        }

        // 2. Filter Logic
        const validTimestamps = timestamps.filter(t => Number.isInteger(t) && t > 0);
        
        if (validTimestamps.length === 0) {
            return res.status(400).json({ error: 'No valid timestamps provided (must be positive integers).' });
        }

        // 3. Math Logic
        validTimestamps.sort((a, b) => a - b);
        const durationTotal = validTimestamps[validTimestamps.length - 1] - validTimestamps[0];
        const durationMedian = calculateMedian(validTimestamps) - validTimestamps[0];

        const generatedUrl = `https://server/record?name=${name}&duration=${formatDuration(durationTotal)}&median=${formatDuration(durationMedian)}`;

        // 4. Call Auth Service
        let userEmail = "";
        try {
            const authResponse = await axios.patch(`${AUTH_MS_URL}/internal/update-url`, {
                name,
                url: generatedUrl
            });
            userEmail = authResponse.data.email;
        } catch (err) {
            return res.status(404).json({ 
                error: 'User not found in Auth Service', 
                details: err.message 
            });
        }

        // 5. Call Email Service API (Replaces direct Queue connection)
        let emailStatus = "Failed";
        try {
            await axios.post(`${EMAIL_MS_URL}/send`, {
                email: userEmail,
                name: name,
                url: generatedUrl
            });
            emailStatus = "Queued Successfully via Email API";
        } catch (emailErr) {
            console.error("Email API Error:", emailErr.message);
            emailStatus = "Failed: Email Service Unavailable";
        }

        // 6. Response
        res.json({ 
            message: "Calculation Complete",
            generatedUrl: generatedUrl,
            emailDispatch: {
                status: emailStatus,
                recipient: userEmail
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};