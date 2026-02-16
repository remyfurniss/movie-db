import { Router } from "express";
import prisma from "../prismaClient";
import {getOrCreateMovie} from "../services/getOrCreateMovie"


const router = Router();

/**
 * Add or update rating for a movie
 * body: { movieId, score }
 */
router.post("/", async (req, res) => {
  const tmdbId = Number(req.body.tmdbId);
  const { score } = req.body;

  if (Number.isNaN(tmdbId) || score == null) {
    return res.status(400).json({ error: "tmdbId and score required" });
  }

  try {
    // ensure movie exists
    const movie = await getOrCreateMovie(tmdbId);

    // upsert by LOCAL movieId
    const rating = await prisma.rating.upsert({
      where: { movieId: movie.id },
      update: { score },
      create: {
        movieId: movie.id,
        score,
      },
    });

    res.json(rating);
  } catch (err: any) {
    console.error("Rating upsert error:", err);
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
