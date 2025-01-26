const bcryptjs = require('bcryptjs');
const db = require('../db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// 이메일 전송 설정
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 회원 가입
const registerUser = async (req, res) => {
    const { userId, password, nickname, email, phone, birth } = req.body;

    // 비밀번호 8자리 이상
    if (password.length < 8) return res.status(400).send('비밀번호는 최소 8자리 이상이어야 합니다.');

    // 비밀번호 암호화
    const hash = await bcryptjs.hash(password, 10);

    // 아이디 중복 체크
    const existingUser = await db.collection('user').findOne({ userId });
    if (existingUser) return res.status(400).send('이미 사용 중인 아이디입니다.');

    // 사용자 정보 DB에 저장
    await db.collection('user').insertOne({ nickname, userId, password: hash, email, phone, birth });
    res.redirect('/login');
};

// 로그인
const loginUser = (req, res) => {
    res.render('login.ejs');
};

// 이메일 인증을 위한 링크 보내기
const sendVerificationEmail = async (req, res) => {
    const { email } = req.body;
    const user = await db.collection('user').findOne({ email });

    if (!user) return res.status(400).send('이메일 주소가 존재하지 않습니다.');

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationLink = `${process.env.BASE_URL}/verify/${verificationToken}`;

    // 이메일 전송
    await transporter.sendMail({
        to: email,
        subject: '이메일 인증',
        text: `아래 링크를 클릭하여 이메일 인증을 완료하세요:\n${verificationLink}`,
    });

    // DB에 인증 토큰 저장
    await db.collection('user').updateOne(
        { email },
        { $set: { verificationToken } }
    );

    res.send('인증 이메일이 발송되었습니다. 이메일을 확인하세요.');
};

// 인증 토큰 확인 후 이메일 인증 완료 처리
const verifyEmail = async (req, res) => {
    const { token } = req.params;
    const user = await db.collection('user').findOne({ verificationToken: token });

    if (!user) return res.status(400).send('유효하지 않은 인증 토큰입니다.');

    await db.collection('user').updateOne(
        { verificationToken: token },
        { $set: { isVerified: true }, $unset: { verificationToken: 1 } }
    );

    res.send('이메일 인증이 완료되었습니다!');
};

module.exports = { registerUser, loginUser, sendVerificationEmail, verifyEmail };
