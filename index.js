/* express 세팅 */
const express = require('express');
const app = express();
const router = express.Router();

/* css */
app.use('/public', express.static('public'))

/* body-parser */
app.use(express.urlencoded({ extended: true }))

/* ejs */
app.set('view engine', 'ejs');

/* env */
require('dotenv').config()

/* mongoDB */
const MongoClient = require('mongodb').MongoClient;
var db;
MongoClient.connect(process.env.DB_URL, { useUnifiedTopology: true }, function (에러, client) {
    if (에러) return console.log(에러);

    db = client.db('test');

    // listen(포트번호, 실행함수)
    // url: localhost:8080
    app.listen(process.env.PORT, function () {
        console.log('listening on 8080');
    });
})
// listen으로 포트 설정, get으로 경로 설정

/* method-override */
const methodOverride = require('method-override');
const passport = require('passport');
app.use(methodOverride('_method'))

/* passport */
const pw = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const { render } = require('ejs');
const { Router } = require('express');

app.use(session({ secret: '비밀코드', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());



/////////////// nav Router
router.get('/', (req, res) => {
    res.render('home.ejs')
})
router.get('/list', (req, res) => {
    res.render('list.ejs')
})
router.get('/login', (req, res) => {
    res.render('login.ejs')
})


/////////////// 상세페이지
app.get('/detail/:id', function (요청, 응답) {

    db.collection('post').findOne({ _id: parseInt(요청.params.id) }, function (에러, 결과) {
        응답.render('detail.ejs', { detail: 결과 })
    })
})



/////////////// get요청
// 홈
app.get('/', function (req, res) {
    // HTML 파일 보내기
    // 응답.sendFile(__dirname + '/index.html');

    res.render('home.ejs')
});
// 로그인
app.get('/login', (req, res) => {
    res.render('login.ejs')
})
// 마이페이지
app.get('/mypage', 로그인했니, (req, res) => {
    res.render('mypage.ejs', { 사용자: req.user })
})
// 마이페이지 접속 전 미들웨어
function 로그인했니(req, res, next) {
    console.log(req.user)
    if (req.user) {
        // user가 있으면 통과라는 뜻
        next()
    } else {
        res.send('로그인안하셨씁니다')
    }
}
// 회원가입
app.get('/signup', (req, res) => {
    res.render('signup.ejs')
})



/////////////// 로그인 기능
app.post('/login', pw.authenticate('local', {
    failureRedirect: '/fail'
    // => 로그인 인증방식 설정
}), (req, res) => {
    res.redirect('/')
})
// 로그인 인증방식
pw.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
        if (에러) return done(에러)

        if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
        if (입력한비번 == 결과.pw) {
            return done(null, 결과)
        } else {
            return done(null, false, { message: '비번틀렸어요' })
        }
    })
}));
// 세션에 저장
passport.serializeUser(function (user, done) {
    done(null, user.id, user.pw)
});
// 로그인한 유저의 개인정보를 DB에서 찾는 역할
passport.deserializeUser(function (아이디, done) {
    // db에서 user.id로 유저를 찾은 뒤에 유저 정보들을 done에 넣음
    db.collection('login').findOne({ id: 아이디 }, (err, out) => {
        done(null, out)
    })
});



/////////////// 회원가입 기능
app.post('/account', (req, res) => {
    db.collection('login').insertOne({ id: req.body.addId, pw: req.body.addPw }, function (err, out) {
        if (err) { console.log('실패!!') }

        res.redirect('/login')
    })
})



/////////////// CRUD 기능
// 발행기능
app.post('/add', function (요청, 응답) {
    // console.log(요청.user.pw)
    // console.log(요청.user.id)
    // console.log(요청.user._id)

    db.collection('counter').findOne({ name: '게시물갯수' }, function (에러, 결과) {
        var 총게시물갯수 = 결과.totalPost
        let 저장데이터 = {
            _id: 총게시물갯수 + 1,
            작성자: 요청.user._id,
            제목: 요청.body.title,
            날짜: 요청.body.date
        }

        db.collection('post').insertOne(저장데이터, function (에러, 결과) {
            db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (에러, 결과) {
                if (에러) { return console.log(에러) }
                응답.redirect('/list');
            })
        })

    })
})
// 발행한 데이터 파일에 꽂기
app.get('/list', function (요청, 응답) {
    db.collection('post').find().toArray(function (에러, 결과) {
        // console.log(결과);
        응답.render('list.ejs', { posts: 결과 })
    })
})
// 삭제기능
app.delete('/delete', function (요청, 응답) {
    // console.log(typeof parseInt(요청.body._id))
    요청.body._id = parseInt(요청.body._id)
    let 클릭한글번호 = 요청.body._id;
    let 작성자아이디 = 요청.user._id;
    console.log(요청.user._id)

    db.collection('post').deleteOne({ _id: 요청.body._id, 작성자: 요청.user._id }, function (에러, 결과) {
        console.log('삭제완료차차')

        // 삭제할 때 총게시물갯수 -1
        db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: -1 } }, function (에러, 결과) {
            if (에러) { return console.log(에러) }
        })
        응답.send('삭제완료차차');
    })
})
// 수정기능
app.get('/edit/:id', (req, res) => {
    db.collection('post').findOne({ _id: parseInt(req.params.id) }, function (err, out) {
        res.render('edit.ejs', { posts: out });
    })
})
app.put('/edit', function (req, res) {

    // 폼에 담긴 데이터를 가지고 
    // db.collection에 업데이트
    console.log(req.body)
    db.collection('post').updateOne({ _id: parseInt(req.body.editId) }, { $set: { 제목: req.body.title, 날짜: req.body.date } }, function (err, out) {
        res.redirect('/list')
    })
})



/////////////// 검색기능
app.get('/search', (req, res) => {
    // console.log(req.query.value)
    // db.collection('post')
    //     .find({ $text: { $search: req.query.value } })
    //     .toArray((err, out) => {
    //         res.render('search.ejs', { posts: out })
    //     })

    // 인덱스 검색조건
    var 검색조건 = [
        {
            $search: {
                index: 'titleSearch',
                text: {
                    query: req.query.value,
                    path: '제목'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
                }
            }
        },
        // { $sort: { _id: -1 } }
    ]

    db.collection('post')
        .aggregate(검색조건)
        .toArray((err, out) => {
            res.render('search.ejs', { posts: out })
        })
})











// commnet 페이지
app.get('/comment', function (요청, 응답) {
    db.collection('comment').find().toArray(function (에러, 결과) {
        // comment.ejs에 데이터 꽂기
        응답.render('comment.ejs', { comments: 결과 })
    })
})
// comment 전송
app.post('/comPost', function (요청, 응답) {
    db.collection('counter').findOne({ name: '댓글갯수' }, function (에러, 결과) {
        let 총댓글갯수 = 결과.totalPost

        // 데이터에 내용 전송
        db.collection('comment').insertOne({ _id: 총댓글갯수 + 1, 작성자: 요청.body.nickname, 내용: 요청.body.content }, function (에러, 결과) {
            db.collection('counter').updateOne({ name: '댓글갯수' }, { $inc: { totalPost: 1 } }, function (에러, 결과) {
                응답.redirect('/comment')
            })
        })
    })

})
// comment 삭제
app.delete('/comDelete', function (요청, 응답) {
    요청.body._id = parseInt(요청.body._id)


    db.collection('comment').deleteOne(요청.body, function (에러, 결과) {

        // 삭제할 때 총게시물갯수 -1
        db.collection('counter').updateOne({ name: '댓글갯수' }, { $inc: { totalPost: -1 } }, function (에러, 결과) {
            응답.send('삭제완료')
        })
    })
})