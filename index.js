/* express 세팅 */
const express = require('express');
const app = express();

/* body-parser */
app.use(express.urlencoded({ extended: true }))

/* ejs */
app.set('view engine', 'ejs');

/* mongoDB */
const MongoClient = require('mongodb').MongoClient;

var db;
MongoClient.connect('mongodb+srv://test:581583@cluster0.jhxqo.mongodb.net/test?retryWrites=true&w=majority', { useUnifiedTopology: true }, function (에러, client) {
    if (에러) return console.log(에러);

    db = client.db('test');

    // listen(포트번호, 실행함수)
    // url: localhost:8080
    app.listen(8080, function () {
        console.log('listening on 8080');
    });
})
// listen으로 포트 설정, get으로 경로 설정



// (경로, 실행함수)
// function(요청, 응답)
app.get('/main', function (요청, 응답) {
    응답.send('mainddd');
});


// detail 페이지
app.get('/detail/:id', function (요청, 응답) {

    db.collection('post').findOne({ _id: parseInt(요청.params.id) }, function (에러, 결과) {
        console.log(결과)
        console.log('되?')
        응답.render('detail.ejs', { detail: 결과 })
    })
})


// '/' 하나쓰면 홈
// HTML 파일 보내기
app.get('/', function (요청, 응답) {
    응답.sendFile(__dirname + '/index.html');
});


// form태그 POST 요청
app.post('/add', function (요청, 응답) {
    db.collection('counter').findOne({ name: '게시물갯수' }, function (에러, 결과) {
        var 총게시물갯수 = 결과.totalPost

        db.collection('post').insertOne({ _id: 총게시물갯수 + 1, 제목: 요청.body.title, 날짜: 요청.body.date }, function (에러, 결과) {
            db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (에러, 결과) {
                if (에러) { return console.log(에러) }
                응답.send('전송완료');
            })
        })

    })
})


// mongoDB에서 데이터 꺼내와 list.ejs에 꽂기
app.get('/list', function (요청, 응답) {
    db.collection('post').find().toArray(function (에러, 결과) {
        // console.log(결과);
        응답.render('list.ejs', { posts: 결과 })
    })
})


// 삭제기능
app.delete('/delete', function (요청, 응답) {
    console.log(typeof parseInt(요청.body._id))

    요청.body._id = parseInt(요청.body._id)
    console.log(요청.body)

    db.collection('post').deleteOne(요청.body, function (에러, 결과) {
        console.log('삭제완료차차')

        // 삭제할 때 총게시물갯수 -1
        db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: -1 } }, function (에러, 결과) {
            if (에러) { return console.log(에러) }
        })
        응답.send('삭제완료차차');
    })
})