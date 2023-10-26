const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const authMiddleware = require("../middlewares/auth-middleware");

const { Users, UserInfos } = require("../models");

// 회원가입
router.post("/users", async (req, res) => {
  const { email, password, name, age, gender, profileImage } = req.body;
  const isExistUser = await Users.findOne({ where: { email } });

  if (isExistUser) {
    return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
  }

  // Users 테이블에 사용자를 추가합니다.
  const user = await Users.create({ email, password });
  // UserInfos 테이블에 사용자 정보를 추가합니다.
  const userInfo = await UserInfos.create({
    UserId: user.userId, // 생성한 유저의 userId를 바탕으로 사용자 정보를 생성합니다.
    name,
    age,
    gender: gender.toUpperCase(), // 성별을 대문자로 변환합니다.
    profileImage,
  });

  return res.status(201).json({ message: "회원가입이 완료되었습니다." });
});

// 로그인
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await Users.findOne({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: "존재하지 않는 이메일입니다." });
  } else if (user.password !== password) {
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  const token = jwt.sign({ userId: user.userId }, "customized_secret_key");

  res.cookie("authorization", `Bearer ${token}`);

  return res.status(200).json({ message: "로그인 성공" });
});

// NEW - 로그아웃
router.post("/logout", async (req, res) => {
  if (!req.cookies.authorization) {
    return res.status(403).json({ message: "로그아웃 실패" });
  }
  res.clearCookie("authorization");
  return res.status(200).json({ message: "로그아웃 성공" });
});

// NEW - 사용자 조회
router.get("/users/me", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;

  console.log({ userId });

  const user = await Users.findOne({
    // attributes: ["userId", "email", "createdAt", "updatedAt"],
    attributes: { exclude: ["password"] },
    include: [
      {
        model: UserInfos,
        attributes: ["name", "age", "gender", "profileImage"],
      },
    ],
    where: { userId },
  });

  return res.status(200).json({ data: user });
});

// 사용자 조회
router.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;

  const user = await Users.findOne({
    // attributes: ["userId", "email", "createdAt", "updatedAt"],
    attributes: { exclude: ["password"] },
    include: [
      {
        model: UserInfos,
        attributes: ["name", "age", "gender", "profileImage"],
      },
    ],
    where: { userId },
  });

  return res.status(200).json({ data: user });
});

module.exports = router;
