require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const app = express();

// 미들웨어 설정
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs'); // ejs 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport와 세션 설정
require('./config/passport');
app.use(session({
    secret: '암호화에 쓸 비번',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 },
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL,
        dbName: 'ownercalculator'
    })
}));
app.use(passport.initialize());
app.use(passport.session());

// 라우터 설정
const authRoutes = require('./routes/authRoutes');
const materialRoutes = require('./routes/materialRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/', authRoutes);
app.use('/materials', materialRoutes);
app.use('/products', productRoutes);
app.use('/users', userRoutes);

// MongoDB 연결
mongoose.connect(process.env.DB_URL)
    .then(() => console.log('DB 연결 성공'))
    .catch(err => console.error(err));

// 서버 시작
app.listen(3000, () => {
    console.log('서버가 http://localhost:3000 에서 실행 중');
});
