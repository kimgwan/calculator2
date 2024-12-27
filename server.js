
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
app.get('/signup', (req, res) => {
    res.render('signup.ejs')
})
//노드메일러 설정정
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

// 토큰 만료 확인 함수
const isTokenExpired = (record) => {
    const now = new Date();
    const expiresAt = new Date(record.createdAt);
    expiresAt.setHours(expiresAt.getMinutes() + 5); // 토큰 만료 시간 5분 설정정
    return now > expiresAt;
};

app.get('/verify-email', async (req, res) => {
    try {
        const email = req.body.email;  // 폼에서 전달된 이메일을 가져옵니다.

        // 이메일이 제대로 전달되었는지 확인
        if (!email) {
            return res.status(400).send('이메일을 입력해주세요.');
        }

        const { token } = req.query;
        // 이메일 중복 체크
        const existingEmail = await db.collection('user').findOne({ email });
        if (existingEmail) {
            return res.status(400).send('이미 사용 중인 이메일입니다.');
        } else {
            //이메일 인증 토큰 생성
            const verificationToken = crypto.randomBytes(32).toString('hex');
            // 이메일 전송
            const verificationUrl = `http://localhost:3000/verify-email?token=${verificationToken}`;
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: '사장계산기의 회원가입 인증을 해주세요.',
                html: `<p>아래 링크를 클릭해 이메일을 인증하세요:</p>
           <a href="${verificationUrl}">${verificationUrl}</a>`,
            });
        }

        // 인증 토큰으로 사용자 찾기
        const user = await db.collection('user').findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).send('유효하지 않은 인증 토큰입니다.');
        }

        console.log('확인')

        // 만료 확인
        if (isTokenExpired(record)) {
            return res.status(400).send('인증 링크가 만료되었습니다.');
        }

        // 이메일 인증 완료 처리
        await db.collection('user').updateOne(
            { _id: user._id },
            { $set: { isVerified: true }, $unset: { verificationToken: "" } }
        );

        res.status(200).send('이메일 인증이 완료되었습니다.');
    } catch (error) {
        console.error('이메일 인증 에러:', error);
        res.status(500).send('서버 오류');
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
