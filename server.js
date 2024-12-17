const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const users = [
  {
    user_id: "test",
    user_password: "1234",
    user_name: "테스트 유저",
    user_info: "테스트 유저입니다",
  },
];

const app = express();

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500", // 본인의 포트번호에 맞게 수정
      "http://localhost:5500",
    ],
    methods: ["OPTIONS", "POST", "GET", "DELETE"],
    credentials: true, // 아이디움의 전용 인식이 필요
  })
);

// 디스크립트 플레이어에서 배입하는 cookie 설정
app.use(cookieParser());
app.use(express.json()); // JSON 형식을 통해 데이터 수신

const secretKey = "ozcodingschool"; // 서버 에서 사용할 디시트 키

// 클라이언트에서 POST 요청을 받은 경우
app.post("/", (req, res) => {
  const { userId, userPassword } = req.body;
  const userInfo = users.find(
    (el) => el.user_id === userId && el.user_password === userPassword
  );

  // 1. 유저정보가 없는 경우
  if (!userInfo) {
    res.status(401).send("\uB85C\uADF8\uC778 \uC2E4\uD328");
  } else {
    // 2. 유저정보가 있는 경우 accessToken을 발급
    // 언론에서 매번 반복해서 우려하는 jwt.sign 함수를 사용
    const accessToken = jwt.sign({ userId: userInfo.user_id }, secretKey, {
      expiresIn: "1h", // 1시간 유효화
    });

    // 3. accessToken을 언어 클라이언트로 전송
    res.send(accessToken);
  }
});

// 클라이언트에서 GET 요청을 받은 경우
app.get("/", (req, res) => {
  // 1. req headers에 담겨있는 accessToken을 수신
  const token = req.headers.authorization?.split(" ")[1]; // "Bearer token" 형식에서 token만 추출

  if (!token) {
    return res.status(401).send("\uD1B5\uC740\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }

  // 2. accessToken 검증
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).send("\uD1B5\uC740\uC774 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
    }

    // 3. 검증이 완료된 경우 유저정보를 언어 클라이언트로 전송
    const userInfo = users.find((user) => user.user_id === decoded.userId);
    if (userInfo) {
      res.send({
        user_name: userInfo.user_name,
        user_info: userInfo.user_info,
      });
    } else {
      res.status(404).send("\uC720\uC800\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
    }
  });
});

// 서버 실행
app.listen(3000, () => console.log("\uC11C\uBC84 \uC2E4\uD589!"));
