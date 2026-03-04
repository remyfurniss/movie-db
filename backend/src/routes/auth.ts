import express from "express";
import { z } from "zod";
import prisma from "../prismaClient";
import {requireAuth } from "../middleware/auth";
import {registerUser, loginUser} from "../services/auth/authService";

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = registerSchema;

router.post("/register", async (req, res) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const result = await registerUser(parsed.email, parsed.password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const result = await loginUser(parsed.email, parsed.password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
    },
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

export default router;