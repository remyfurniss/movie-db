import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

router.post("/ratings", async (req, res) => {
  const { movieId, score } = req.body;

  const rating = await prisma.rating.upsert({
    where: { movieId },
    update: { score },
    create: { movieId, score },
  });

  res.json(rating);
});

export default router;
