import { Router } from "express";
import prisma from "../prismaClient";
import {getOrCreateMovie} from "../services/getOrCreateMovie"
import {requireAuth } from "../middleware/auth";


const router = Router();

/**
 * Add or update rating for a movie
 * body: { movieId, score }
 */
router.post("/", requireAuth, async (req, res) => {


  const tmdbId = Number(req.body.tmdbId);
  const { score } = req.body;
  const userId = req.userId

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  if (Number.isNaN(tmdbId)) {
    return res.status(400).json({ error: "Invalid tmdbId" });
  }

  try {
    // ensure movie exists
    const movie = await getOrCreateMovie(tmdbId);

     if (score === null) {
      await prisma.rating.deleteMany({
        where: {
          userId,
          movieId: movie.id,
        },
      });

      return res.json({ movieId: movie.id, score: null });
    }

    // upsert by LOCAL movieId
    const rating = await prisma.rating.upsert({
      where: {
        userId_movieId: {
          userId,
          movieId: movie.id,
        },
      },
      update: {
        score,
      },
      create: {
        userId,
        movieId: movie.id,
        score,
      },
    });

    console.log(rating);

    res.json(rating);
  } catch (err: any) {
    console.error("Rating upsert error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get rating for a movie
 */
router.get("/:tmdbId", requireAuth, async (req, res) => {



  const tmdbId = Number(req.params.tmdbId);
  const userId = req.userId;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  if (Number.isNaN(tmdbId)) {
    return res.status(400).json({ error: "Invalid tmdbId" });
  }

  try {
    const movie = await getOrCreateMovie(tmdbId);

    const rating = await prisma.rating.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId: movie.id,
        },
      },
    });

    res.json({ score: rating?.score ?? null });
  } catch (err: any) {
    console.error("Fetch rating error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
