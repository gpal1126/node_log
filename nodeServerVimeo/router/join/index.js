const express = require('express');
const app = express();
const router = express.Router();
const path = require('path');
const mysql = require('mysql');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// DATABASE SETTING
const conn = mysql.createConnection({
    host: '211.253.31.56',
    port: 3306,
    user: 'lindas', 
    password: 'Wlstns676@!',
    database: 'test',
});

conn.connect();

// GET
router.get('/', function(req, res){
    console.log('Get join url');
    //res.sendFile((path.join(__dirname, '../../', '/public/join.html')));
    let msg;
    let errMsg = req.flash('error');
    if( errMsg ) msg = errMsg;
    res.render('join.ejs', {'message': msg});
});

// passport.serialize
passport.serializeUser(function(user, done){
    console.log('passport session save : ', user.id);
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    console.log('passport session get id : ', id);
    done(null, id);
});

passport.use('local-join', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
    }, function(req, email, password, done){
        console.log('local-join callback called');
        let query = conn.query('SELECT * FROM USER_TB WHERE email=?', [email], function(err, rows){
            if( err ) return done(err);

            if( rows.length ){
                console.log('existed user');
                return done(null, false, {message: 'your email is alread used'});
            }else {
                let sql = { email: email, pw: password };
                let query = conn.query('INSERT INTO USER_TB SET ? ', sql, function(err, rows){
                    if( err ) throw err;
                    return done(null, { 'email': email, 'id': rows.insertId });
                });
            }
        });
    }
));

router.post('/', passport.authenticate('local-join', {
   successRedirect: '/main', 
   failureRedirect: '/join',
   failureFlash: true, })
);

// POST
/* router.post('/', function(req, res){
    console.log('Post join');
    let email = req.body.email;
    let name = req.body.name;
    let password = req.body.password;
    console.log(email, name, password);

    //let query = conn.query('INSERT INTO USER_TB(email, name, pw) VALUES(?, ?, ?)', [email, name, password], function(err, rows){
    let sql = { email: email, name: name, pw: password };
    let query = conn.query('INSERT INTO USER_TB SET ? ', sql, function(err, rows){
        if( err ) throw err;
        console.log("ok db insert : ", rows.insertId, name);
        res.render('welcome.ejs', { 'id': rows.insertId, 'name':name });
    });
}); */

module.exports = router;