import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

// Create a user
router.post("/", async (req, res) => {
  const { name, email, role } = req.body;
  try {
    const user = await prisma.user.create({
      data: { name, email, role },
    });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
router.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Get a user by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
  });
  res.json(user);
});

// Update a user
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: { name, email, role },
  });
  res.json(user);
});

// Delete a user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id: Number(id) } });
  res.json({ message: "User deleted" });
});

export default router;
