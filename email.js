const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, token) => {
    // For development, we'll use a test account from Ethereal.
    // In production, you'll replace this with your actual email provider's settings.
    let testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    // The verification URL the user will click
    const verificationUrl = `http://localhost:5173/verify-email/${token}`; // Update with your frontend URL

    const mailOptions = {
        from: '"CryptoMarket" <noreply@cryptomarket.com>',
        to: email,
        subject: 'Verify Your Email Address',
        html: `
            <p>Thank you for registering with CryptoMarket!</p>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}" target="_blank">${verificationUrl}</a>
            <p>This link will expire in 1 hour.</p>
        `,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        // You can see the preview URL in the console to view the sent email
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};

module.exports = { sendVerificationEmail };