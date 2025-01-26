const nodemailer = require('nodemailer');

// 이메일 전송 설정
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 이메일 전송 함수
const sendEmail = async (to, subject, text, html) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html,
        });
    } catch (error) {
        console.error('Email sending error:', error);
    }
};

module.exports = { sendEmail };
