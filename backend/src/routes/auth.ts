import express from "express";
import { z } from "zod";
import prisma from "../prismaClient";
import {requireAuth } from "../middleware/auth";
import {registerUser, loginUser} from "../services/auth/authService";

const router = express.Router();

const registerSchema = z.object({
  email: z.string(),
  password: z.string().min(6),
});

const loginSchema = registerSchema;

/**
 * Register user
 */
router.post("/register", async (req, res) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const result = await registerUser(parsed.email, parsed.password);
    res.json(result);
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * Login user
 */
router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const result = await loginUser(parsed.email, parsed.password);
    res.json(result);
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * Authernticate current user
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err: any) {
    console.error("Fetch /me error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;