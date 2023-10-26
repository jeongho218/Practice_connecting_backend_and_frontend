const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth-middleware");

const { Posts, Users } = require("../models");
const { Op } = require("sequelize");

// 게시글 생성
router.post("/posts", authMiddleware, async (req, res) => {
  try {
    const { userId: UserId } = res.locals.user;
    const { title, content } = req.body;

    const post = await Posts.create({
      UserId,
      title,
      content,
    });

    return res.status(201).json({ data: post });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({ message: error.message });
  }
});

// 게시글 목록 조회
// routes/posts.route.js

// 게시글 목록 조회
router.get("/posts", async (req, res) => {
  const posts = await Posts.findAll({
    attributes: ["postId", "title", "createdAt", "updatedAt"],
    include: { model: Users },
    order: [["createdAt", "DESC"]],
  });

  return res.status(200).json({ data: posts });
});

// 게시글 상세 조회
router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;

  const post = await Posts.findOne({
    attributes: { exclude: ["UserId"] },
    include: Users,
    where: { postId },
  });

  return res.status(200).json({ data: post });
});

// 게시글 수정
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;
  const { title, content } = req.body;

  // 게시글을 조회합니다.
  const post = await Posts.findOne({ where: { postId } });

  if (!post) {
    return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
  } else if (post.UserId !== userId) {
    return res.status(403).json({ message: "권한이 없습니다." });
  }

  // 게시글의 권한을 확인하고, 게시글을 수정합니다.
  await Posts.update(
    { title, content }, // title과 content 컬럼을 수정합니다.
    {
      where: {
        [Op.and]: [{ postId }, { UserId: userId }],
      },
    }
  );

  return res.status(200).json({ data: "게시글이 수정되었습니다." });
});

// 게시글 삭제
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;

  // 게시글을 조회합니다.
  const post = await Posts.findOne({ where: { postId } });

  if (!post) {
    return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
  } else if (post.UserId !== userId) {
    return res.status(403).json({ message: "권한이 없습니다." });
  }

  // 게시글의 권한을 확인하고, 게시글을 삭제합니다.
  await Posts.destroy({
    where: {
      [Op.and]: [{ postId }, { UserId: userId }],
    },
  });

  return res.status(200).json({ data: "게시글이 삭제되었습니다." });
});

module.exports = router;
