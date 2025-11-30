import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import prisma from "prisma/prisma_client.js";

const router: ReturnType<typeof Router> = Router();

// User Registration
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "User registration failed" });
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const jwtSecret = process.env["JWT_SECRET"];

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: "2h" });
  return res.json({ token });
});

export default router;
