import startWorker from '../src/workers/emailWorker';
import { getChannel } from '../src/config/rabbitmq';

// Mocks
const mockChannel = { consume: jest.fn(), ack: jest.fn(), sendToQueue: jest.fn() };
const mockTransporter = { sendMail: jest.fn() };

// Mock Imports
jest.mock('../src/config/rabbitmq', () => ({
    getChannel: jest.fn(() => mockChannel),
    QUEUE_NAME: 'test_queue'
}));

jest.mock('../src/config/transporter', () => jest.fn(() => mockTransporter));
jest.mock('nodemailer');

describe('Email Worker Logic Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        startWorker(); // Init worker
    });

    const triggerMessage = async (payload: object) => {
        // Manually trigger the callback function that 'consume' registered
        const callback = (mockChannel.consume as jest.Mock).mock.calls[0][1];
        await callback({ content: Buffer.from(JSON.stringify(payload)) });
    };

    it('should ACK message on success', async () => {
        (mockTransporter.sendMail as jest.Mock).mockResolvedValue({ messageId: '1' });
        
        await triggerMessage({ email: 'ok@test.com', name: 'Test', url: 'http://url' });
        
        expect(mockChannel.ack).toHaveBeenCalled();
        expect(mockChannel.sendToQueue).not.toHaveBeenCalled();
    });

    it('should REQUEUE if retries < 3', async () => {
        (mockTransporter.sendMail as jest.Mock).mockRejectedValue(new Error("Fail"));
        
        await triggerMessage({ email: 'fail@test.com', retryCount: 0 });
        
        // Expect Requeue
        expect(mockChannel.sendToQueue).toHaveBeenCalled();
        // Verify Retry Count incremented
        const args = JSON.parse((mockChannel.sendToQueue as jest.Mock).mock.calls[0][1].toString());
        expect(args.retryCount).toBe(1);
    });
});