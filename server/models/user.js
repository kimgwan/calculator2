const mongoose = require('mongoose');

// 유저 모델
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nickname: String,
    email: { type: String, required: true, unique: true },
    phone: String,
    birth: String,
    isVerified: { type: Boolean, default: false },
    verificationToken: String,  // 이메일 인증을 위한 토큰 필드 추가
});

// 유저 모델 export
module.exports = mongoose.model('User', userSchema);
