// Mocks
const mockChannel = { consume: jest.fn(), ack: jest.fn(), sendToQueue: jest.fn() };
const mockTransporter = { sendMail: jest.fn() };

jest.mock('../src/config/rabbitmq', () => ({
    getChannel: jest.fn(() => mockChannel),
    QUEUE_NAME: 'test_queue'
}));
jest.mock('../src/config/transporter', () => jest.fn(() => mockTransporter));
jest.mock('nodemailer'); // Prevent real calls

const startWorker = require('../src/workers/emailWorker');

describe('Email Worker Logic Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        startWorker(); // Init worker
    });

    const triggerMessage = async (payload) => {
        const callback = mockChannel.consume.mock.calls[0][1];
        await callback({ content: Buffer.from(JSON.stringify(payload)) });
    };

    it('should ACK message on success', async () => {
        mockTransporter.sendMail.mockResolvedValue({ messageId: '1' });
        await triggerMessage({ email: 'ok@test.com' });
        expect(mockChannel.ack).toHaveBeenCalled();
        expect(mockChannel.sendToQueue).not.toHaveBeenCalled();
    });

    it('should REQUEUE if retries < 3', async () => {
        mockTransporter.sendMail.mockRejectedValue(new Error("Fail"));
        
        await triggerMessage({ email: 'fail@test.com', retryCount: 0 });
        
        // Expect Requeue with count 1
        expect(mockChannel.sendToQueue).toHaveBeenCalled();
        const args = JSON.parse(mockChannel.sendToQueue.mock.calls[0][1].toString());
        expect(args.retryCount).toBe(1);
        // Expect old message removed
        expect(mockChannel.ack).toHaveBeenCalled();
    });

    it('should DROP message if retries >= 3', async () => {
        mockTransporter.sendMail.mockRejectedValue(new Error("Fail"));
        
        await triggerMessage({ email: 'fail@test.com', retryCount: 3 });
        
        // Expect Ack (Drop) but NO Requeue
        expect(mockChannel.ack).toHaveBeenCalled();
        expect(mockChannel.sendToQueue).not.toHaveBeenCalled();
    });
});