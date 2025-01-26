const express = require('express');
const router = express.Router();
const { registerUser, loginUser, sendVerificationEmail, verifyEmail } = require('../controllers/userController');

// 회원 가입 라우터
router.get('/signup', (req, res) => {
    res.render('signup.ejs');
});

router.post('/register', registerUser);

// 로그인 라우터
router.get('/login', loginUser);

// 이메일 인증 요청 라우터
router.post('/send-verification', sendVerificationEmail);

// 이메일 인증 완료 라우터
router.get('/verify/:token', verifyEmail);

module.exports = router;
