/* express 세팅 */
const express = require('express');
const app = express();

/* body-parser */
app.use(express.urlencoded({ extended: true }))

// (포트번호, 실행함수)
// url: localhost:8080
app.listen(8080, function () {
    console.log('listening on 8080');
});
// listen으로 포트 설정, get으로 경로 설정
// 확인은 터미널 초기화 후 서버 재실행 (node index.js) ==> 자동화는 노드몬
// 노드몬 설치 후 터미널에서 nodemon index.js 하면 내용변경하면 서버자동으로 재실행



// (경로, 실행함수)
// function(요청, 응답)
app.get('/main', function (요청, 응답) {
    응답.send('mainddd');
});

app.get('/profile', function (요청, 응답) {
    응답.send('profileddd');
});

// '/' 하나쓰면 홈
app.get('/', function (요청, 응답) {
    응답.sendFile(__dirname + '/index.html');
});

// form태그 POST 요청
app.post('/add', function (요청, 응답) {
    console.log(요청.body);
    응답.send('전송완료');
})