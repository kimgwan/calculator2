const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController');

router.get('/signup', (req, res) => {
    res.render('signup.ejs');
});

router.post('/register', register);

// 로그인, 이메일 인증 등의 라우터도 추가
module.exports = router;
