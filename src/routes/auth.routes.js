import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../prisma.js";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/register", async (req, res) => {
  const {
    username,
    password,
    fullName,
    address,
    phone,
    email,
  } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      fullName,
      address,
      phone,
      email,
      rid: 1,
      mid: 1
    }
  });

  res.status(201).json({
    message: "Đăng ký thành công",
    user: {
      uid: user.uid,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      score: user.score
    }
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!user) {
    return res.status(401).json({
      message: "Tên đăng nhập hoặc mật khẩu không đúng"
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Tên đăng nhập hoặc mật khẩu không đúng"
    });
  }

  const token = jwt.sign(
  {
    uid: user.uid,
    username: user.username,
    rid: user.rid
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1h"
  }
);

  res.json({
    message: "Đăng nhập thành công",
    token
  });

});

export default router;