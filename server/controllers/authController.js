const bcryptjs = require('bcryptjs');
const db = require('../db');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const register = async (req, res) => {
    const { userId, password, nickname, email, phone, birth } = req.body;
    if (password.length < 8) return res.status(400).send('비밀번호는 최소 8자리 이상이어야 합니다.');

    const hash = await bcryptjs.hash(password, 10);
    const existingUser = await db.collection('user').findOne({ userId });
    if (existingUser) return res.status(400).send('이미 사용 중인 아이디입니다.');

    await db.collection('user').insertOne({ nickname, userId, password: hash, email, phone, birth });
    res.redirect('/login');
};

// 이메일 인증, 로그인 등의 함수도 추가
module.exports = { register };
