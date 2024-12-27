
require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const express = require('express')
const app = express()
const { MongoClient, ObjectId, BSONError } = require('mongodb');
const methodOverride = require('method-override')
const bcryptjs = require('bcryptjs');
const MongoStore = require('connect-mongo')

app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs') // ejs setting
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local');
const { findOne } = require('domutils');

app.use(passport.initialize())
app.use(session({
    secret: '암호화에 쓸 비번',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 },
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://admin:qwer1234@cluster0.emtrs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
        dbName: 'ownercalculator'
    })
}));

app.use(passport.session())

app.use((req, res, next) => {
    res.locals.user = req.user || null; // 로그인된 유저 정보가 있으면 전달, 없으면 null
    next();
});

let db
const url = 'mongodb+srv://admin:qwer1234@cluster0.emtrs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
new MongoClient(url).connect().then((client) => {
    console.log('DB연결성공')
    db = client.db('ownercalculator')
    app.listen(3000, () => {
        console.log('http://localhost:3000 에서 서버 실행중')
    })
}).catch((err) => {
    console.log(err)
})

// 홈 페이지
app.get('/', (req, res) => {
    res.render('index.ejs')
})
app.get('/findPass', (req, res) => {
    res.render('findPass.ejs')
})
app.get('/verifyEmail', (req, res) => {
    res.render('verifyEmail.ejs')
})

// 재료관리 페이지
app.get('/materials', async (req, res) => {
    if (!req.user) {
        res.redirect('/login');
    } else {
        var userMaterialsData = await db.collection('materials').find({ userId: req.user.userId }).toArray();
        res.render('materials.ejs', { data: userMaterialsData })
    }
})

// 상품관리 페이지
app.get('/products', async (req, res) => {
    if (!req.user) {
        res.redirect('/login');
    } else {
        var userMaterialsData = await db.collection('materials').find({ userId: req.user.userId }).toArray();
        var userProductsData = await db.collection('products').find({ userId: req.user.userId }).toArray();
        res.render('products.ejs', { materialsData: userMaterialsData, productsData: userProductsData })
    }
})

// 로그인 페이지
app.get('/login', (req, res) => {
    res.render('login.ejs')
})

// 재료저장
app.post('/save', async (req, res) => {
    try {
        if (req.body.mname == '') {
            res.send('재료명은 필수입력입니다.')
        } else if (req.body.mprice == '') {
            res.send('매입가는 필수입력입니다.')
        } else if (req.body.mcap == '') {
            res.send('중량은 필수입력입니다.')
        } else {
            await db.collection('materials').insertOne
                ({
                    userId: req.body.userId,
                    mname: req.body.mname,
                    mprice: req.body.mprice,
                    mcap: req.body.mcap,
                    mmemo: req.body.mmemo,
                    cUnit: req.body.cUnit,
                    capUnit: req.body.capUnit,
                    minPrice: req.body.minPrice,
                    minCap: req.body.minCap
                })

            res.redirect('/materials')
        }
    } catch (e) {
        console.log(e)
        res.status(500).send('서버에러남')
    }
})

// 상품저장
app.post('/saveProduct', async (req, res) => {
    try {

        // totalValue / productPrice 계산
        const costRatio = req.body.totalValue / req.body.productPrice * 100;

        // 계산된 quantity 값을 사용하여 데이터베이스에 저장
        await db.collection('products').insertOne({
            userId: req.body.userId,
            productTitle: req.body.productTitle,
            productPrice: req.body.productPrice,
            totalValue: req.body.totalValue,
            costRatio: costRatio.toFixed(2) // 계산된 값 추가
        });

        res.redirect('/products');
    } catch (e) {
        res.status(500).send('서버에러남');
    }
});

//상품삭제
app.post('/delProduct', async (req, res) => {
    await db.collection('products').deleteOne({ _id: new ObjectId(req.body._id) })
    res.redirect('/products')

})



// 회원가입 페이지
// app.get('/signup', (req, res) => {
//     if (req.session.email && Date.now() - req.session.verifiedAt <= 5 * 60 * 1000) {
//         res.render('signup.ejs', { email: req.session.email });
//     } else {
//         res.redirect('/verifyEmail');  // 인증이 만료되었으면 인증 페이지로 리디렉션
//     }
// });
app.get('/signup', (req, res) => {
    // 먼저 세션 데이터 확인
    const email = req.session.email;
    const verifiedAt = req.session.verifiedAt;
    
    // 이메일과 인증 여부를 미리 판단
    let emailVerified = false;
    if (email && verifiedAt) {
        const currentTime = Date.now();
        
        // 인증 시간이 5분 이내인지 확인
        if (currentTime - verifiedAt <= 5 * 60 * 1000) {
            emailVerified = true;
        }
    }

    // 인증 여부에 따른 처리
    if (emailVerified) {
        // 인증된 이메일을 전달
        res.render('signup.ejs', { email, emailVerified });
    } else {
        // 인증되지 않거나 인증이 만료되었으면 인증 페이지로 리디렉션
        res.redirect('/verifyEmail');
    }
});

//노드메일러 설정
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
// 회원가입 기능 (이용약관 - 개인정보 수집 등  메일링서비스, 자동 가입 방지)
app.post('/register', async (req, res) => {
    try {
        console.log(req.body)
        const { userId, password, nickname, email, phone, birth } = req.body;

        // 비밀번호 최소 8자리 이상 체크
        if (password.length < 8) {
            return res.status(400).send('비밀번호는 최소 8자리 이상이어야 합니다.');
        }
        // 비밀번호를 해시화
        const hash = await bcryptjs.hash(password, 10);

        // 아이디 중복 체크
        const existingUser = await db.collection('user').findOne({ userId });
        if (existingUser) {
            return res.status(400).send('이미 사용 중인 아이디입니다.');
        }
    
        if (req.session.email !== email || !req.session.verifiedAt || Date.now() - req.session.verifiedAt > 5 * 60 * 1000) {
            return res.redirect('/verifyEmail');  // 인증이 되지 않았다면 인증 페이지로 리디렉션
        }
    
        // 사용자 정보를 DB에 저장
        await db.collection('user').insertOne({ nickname, userId, password: hash, email, phone, birth });

        // 회원가입 후 로그인인 페이지로 리다이렉트
        res.redirect('/login');
    } catch (error) {
        console.error('회원가입 에러:', error);
        res.status(500).send('서버 오류');  // 서버 오류 처리
        console.log(req.body)
    }
});


// id 중복확인
app.post('/check-id', (req, res) => {
    const { userId } = req.body;
    const isDuplicate = existingIds.includes(userId);

    res.json({ isDuplicate });
});

// 로그인 기능
{
    app.post('/login', async (req, res, next) => {
        passport.authenticate('local', (error, user, info) => {
            if (error) return res.status(500).json(error)
            if (!user) return res.status(401).json(info.message)
            req.logIn(user, (err) => {
                if (err) return next(err)
                res.redirect('/')
            })
        })(req, res, next)

    })

    passport.use(new LocalStrategy({
        usernameField: 'userId',
        passwordField: 'password'
    }, async (userId, userPassword, cb) => {
        try {
            let result = await db.collection('user').findOne({ userId });
            if (!result) {
                return cb(null, false, { message: 'ID를 확인해 주세요.' });
            }

            const isMatch = await bcryptjs.compare(userPassword, result.password);
            if (isMatch) {
                return cb(null, result);
            } else {
                return cb(null, false, { message: '비밀번호를 확인해 주세요' });
            }
        } catch (error) {
            return cb(error); // 에러 발생 시 에러를 콜백에 전달
        }
    }));

    passport.serializeUser((user, done) => {
        console.log(user);
        process.nextTick(() => {
            done(null, { id: user._id, username: user.userId }); // userId가 맞는지 확인
        });
    });

    passport.deserializeUser(async (user, done) => {
        try {
            let result = await db.collection('user').findOne({ _id: new ObjectId(user.id) });
            if (result) {
                delete result.password;
                return done(null, result);
            } else {
                return done(null, false); // 사용자 찾지 못한 경우
            }
        } catch (error) {
            return done(error); // 에러 발생 시 에러를 콜백에 전달
        }
    });
}

// 로그아웃 기능
app.get('/logout', (req, res, next) => {
    req.logout((err) => { // Passport의 logout 함수 호출
        if (err) { return next(err); } // 오류 처리
        req.session.destroy((err) => { // 세션 파기
            if (err) {
                console.log('세션 삭제 중 오류 발생:', err);
                return res.status(500).send('서버 오류');
            }
            res.clearCookie('connect.sid'); // 세션 쿠키 제거
            res.redirect('/');
        });
    });
});

// 재료삭제 기능
app.post('/m-delete', async (req, res) => {
    await db.collection('materials').deleteOne({ _id: new ObjectId(req.body._id) })
    res.redirect('/materials')

})

let generatedCode = ''; // 서버 메모리에 인증 코드를 저장합니다.
let userEmail = ''; // 인증을 요청한 이메일
let lastRequestTime = 0; // 마지막 요청 시간
let codeGeneratedTime = 0; // 인증 코드가 생성된 시간

// 이메일인증
app.post('/send-verification', async (req, res) => {
    const currentTime = Date.now(); // 현재 시간

    // 5초 내 중복 요청 방지
    if (currentTime - lastRequestTime < 5000) {
        return res.json({ success: false, message: '5초 이내에 중복 요청은 불가능합니다.' });
    }

    try {
        const { email } = req.body;
        userEmail = email;

        // 6자리 랜덤 인증 코드 생성
        generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        codeGeneratedTime = currentTime; // 인증 코드 생성 시간 기록
        console.log(`인증 코드: ${generatedCode} (이메일: ${email})`);
        // 이메일 발송
        await transporter.sendMail({
            from: '"Your Service" <your-email@gmail.com>',
            to: email,
            subject: '이메일 인증 코드',
            text: `인증번호: ${generatedCode}`,
        });
        req.session.email = email;
        // 인증 코드 발송 후 마지막 요청 시간 기록
        lastRequestTime = currentTime;

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false });
    }
});

// 인증번호 확인 API
app.post('/verify-code', (req, res) => {
    const { code, email } = req.body;
    const currentTime = Date.now();

    // 인증 코드가 생성된 지 5분이 경과했는지 확인
    if (currentTime - codeGeneratedTime > 5 * 60 * 1000) {
        return res.json({ success: false, message: '인증 코드가 만료되었습니다. 다시 요청해주세요.' });
    }

    if (code === generatedCode) {
        // 인증 성공 시 이메일과 인증 완료 시간을 세션에 저장
        req.session.email = email;
        console.log(email)
        req.session.verifiedAt = Date.now();  // 인증 완료 시간
        res.json({ success: true, message: '이메일 인증이 완료되었습니다.' });
        console.log('Session Data after verification:', req.session);

    } else {
        res.json({ success: false, message: '인증 코드가 잘못되었습니다.' });
    }
});

//비번찾기 이메일인증증
app.post('/send-verification-find', async (req, res) => {
    
});
