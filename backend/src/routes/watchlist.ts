import { Router } from "express";
import prisma from "../prismaClient";
import {getOrCreateMovie} from "../services/getOrCreateMovie"
import {requireAuth } from "../middleware/auth";

const router = Router();

/**
 * Create a watchlist
 * body: { name }
 */
router.post("/", requireAuth, async (req, res) => {
  const { name } = req.body;
  const userId = req.userId

  if (!name) {
    return res.status(400).json({ error: "name required" });
  }

  try {
    const watchlist = await prisma.watchlist.create({
      data: { name, userId },
    });

    res.json(watchlist);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get a specific watchlist
 */
router.get("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId

  try {
    const watchlists = await prisma.watchlist.findFirst({
        where: { 
          id,
          userId 
        },
        include: {
            items: {
                include: { movie: true },
            },
        },
    });

    res.json(watchlists);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get all watchlists
 */
router.get("/", requireAuth, async (req, res) => {
  const userId = req.userId

  try {
    const watchlists = await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      include: {
        items: {
          include: { movie: true }, 
        },
      },
    });
    res.json(watchlists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch watchlists" });
  }
});

/**
 * Add movie to watchlist
 */
router.post("/:watchlistId/movies", requireAuth, async (req, res) => {
  const { watchlistId } = req.params;
  const userId = req.userId
  const tmdbId = Number(req.body.tmdbId);

  if (Number.isNaN(tmdbId)) {
    return res.status(400).json({ error: "tmdbId required" });
  }

  try {
    
    // 🔥 verify ownership
    const watchlist = await prisma.watchlist.findFirst({
      where: { id: watchlistId, userId },
    });

    if (!watchlist) {
      return res.status(404).json({ error: "Watchlist not found" });
    }

    // ensure movie exists in DB
    const movie = await getOrCreateMovie(tmdbId);

    // create relation using LOCAL movie id
    await prisma.watchlistItem.create({
      data: {
        watchlistId,
        movieId: movie.id,
      },
    });

    res.json({ message: "Movie added to watchlist" });
  } catch (err: any) {
    console.error("Add to watchlist error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Remove movie from watchlist
 */
router.delete("/:watchlistId/movies/:movieId", requireAuth, async (req, res) => {
  const { watchlistId, movieId } = req.params;
  const userId = req.userId

  try {
    const watchlist = await prisma.watchlist.findFirst({
      where: { id: watchlistId, userId },
    });

    if (!watchlist) {
      return res.status(404).json({ error: "Watchlist not found" });
    }

    await prisma.watchlistItem.delete({
      where: {
        watchlistId_movieId: { watchlistId, movieId },
      },
    });

    res.json({ message: "Movie removed from watchlist" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * delete watchlist
 */
router.delete("/:watchlistId", requireAuth, async (req, res) => {
  const { watchlistId } = req.params;
  const userId = req.userId

  const watchlist = await prisma.watchlist.findFirst({
    where: { id: watchlistId, userId },
  });

  if (!watchlist) {
    return res.status(404).json({ error: "Watchlist not found" });
  }

  await prisma.watchlist.delete({
    where: { id: watchlistId },
  });

  res.json({ message: "Watchlist deleted" });
});

export default router;
