const nodemailer = require('nodemailer');

const createTransporter = async () => {
    // For development: Ethereal Email
    const testAccount = await nodemailer.createTestAccount();
    
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};

module.exports = createTransporter;