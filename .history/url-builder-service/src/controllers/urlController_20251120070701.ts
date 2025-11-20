import { Request, Response } from 'express';
import axios from 'axios';

// Configuration
const AUTH_MS_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const EMAIL_MS_URL = process.env.EMAIL_SERVICE_URL || 'http://email-service:3003';


interface AuthResponse {
    email: string;
    fullname: string;
}

// Helpers
const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h${m}min${s}s`;
};

const calculateMedian = (arr: number[]): number => {
    if (arr.length === 0) return 0;
    arr.sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    if (arr.length % 2 !== 0) return arr[mid];
    return Math.floor((arr[mid - 1] + arr[mid]) / 2);
};

export const buildUrl = async (req: Request, res: Response) => {
    try {
        const { name, timestamps } = req.body;

        // 1. Validation
        if (!name || !timestamps || !Array.isArray(timestamps)) {
            return res.status(400).json({ error: 'Invalid input format' });
        }

        // 2. Filter Logic
        const validTimestamps: number[] = (timestamps as any[])
            .filter((t: any) => Number.isInteger(t) && t > 0);
        
        if (validTimestamps.length === 0) {
            return res.status(400).json({ error: 'No valid timestamps provided' });
        }

        // 3. Math Logic
        validTimestamps.sort((a, b) => a - b);
        const durationTotal = validTimestamps[validTimestamps.length - 1] - validTimestamps[0];
        const durationMedian = calculateMedian(validTimestamps) - validTimestamps[0];

        const generatedUrl = `https://server/record?name=${name}&duration=${formatDuration(durationTotal)}&median=${formatDuration(durationMedian)}`;

        // 4. Call Auth Service
        let userEmail = "";
        try {
            // 👇 2. Use Generic <AuthResponse> here to tell TS what data contains
            const authResponse = await axios.patch<AuthResponse>(`${AUTH_MS_URL}/internal/update-url`, {
                name: name,
                url: generatedUrl
            });
            
            // Now TypeScript knows that .data has .email!
            userEmail = authResponse.data.email;
            
        } catch (err: any) {
            return res.status(404).json({ 
                error: 'User not found in Auth Service', 
                details: err.message 
            });
        }

        // 5. Call Email Service API
        let emailStatus = "Failed";
        try {
            await axios.post(`${EMAIL_MS_URL}/send`, {
                email: userEmail,
                name: name,
                url: generatedUrl
            });
            emailStatus = "Queued Successfully via Email API";
        } catch (emailErr: any) {
            console.error("Email API Error:", emailErr.message);
            emailStatus = "Failed: Email Service Unavailable";
        }

        // 6. Response
        res.json({ 
            generatedUrl: generatedUrl,
            emailDispatch: {
                status: emailStatus,
                recipient: userEmail
            }
        });

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};