const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcryptjs = require('bcryptjs');
const { ObjectId } = require('mongodb');
const db = require('../db'); // MongoDB 연결

passport.use(new LocalStrategy({
    usernameField: 'userId',
    passwordField: 'password'
}, async (userId, userPassword, cb) => {
    try {
        let result = await db.collection('user').findOne({ userId });
        if (!result) return cb(null, false, { message: 'ID를 확인해 주세요.' });

        const isMatch = await bcryptjs.compare(userPassword, result.password);
        if (isMatch) return cb(null, result);
        else return cb(null, false, { message: '비밀번호를 확인해 주세요' });
    } catch (error) {
        return cb(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, { id: user._id, username: user.userId });
});

passport.deserializeUser(async (user, done) => {
    try {
        let result = await db.collection('user').findOne({ _id: new ObjectId(user.id) });
        if (result) {
            delete result.password;
            return done(null, result);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error);
    }
});
