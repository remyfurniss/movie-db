import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

/**
 * Add or update rating for a movie
 * body: { movieId, score }
 */
router.post("/", async (req, res) => {
  const { movieId, score } = req.body;

  if (!movieId || score == null) {
    return res.status(400).json({ error: "movieId and score required" });
  }

  try {
    const rating = await prisma.rating.upsert({
      where: { movieId },
      update: { score },
      create: { movieId, score },
    });

    res.json(rating);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get rating for a movie
 */
router.get("/:movieId", async (req, res) => {
  const { movieId } = req.params;

  try {
    const rating = await prisma.rating.findUnique({
      where: { movieId },
    });

    res.json(rating || { score: null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});



export default router;
