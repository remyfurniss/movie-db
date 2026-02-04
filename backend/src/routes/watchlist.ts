import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

/**
 * Create a watchlist
 * body: { userId, name }
 */
router.post("/", async (req, res) => {
  const { userId, name } = req.body;

  if (!userId || !name) {
    return res.status(400).json({ error: "userId and name required" });
  }

  try {
    const watchlist = await prisma.watchlist.create({
      data: { userId, name },
    });

    res.json(watchlist);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get all watchlists for a user
 */
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            movie: true,
          },
        },
      },
    });

    if (!watchlist) {
      return res.status(404).json({ error: "Watchlist not found" });
    }

    res.json(watchlist);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get a specific watchlist
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const watchlists = await prisma.watchlist.findMany({
        where: { id },
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
 * Add movie to watchlist
 */
router.post("/:watchlistId/movies", async (req, res) => {
  const { watchlistId } = req.params;
  const { movieId } = req.body;

  if (!movieId) {
    return res.status(400).json({ error: "movieId required" });
  }

  try {
    await prisma.watchlistItem.create({
      data: { watchlistId, movieId },
    });

    res.json({ message: "Movie added to watchlist" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Remove movie from watchlist
 */
router.delete("/:watchlistId/movies/:movieId", async (req, res) => {
  const { watchlistId, movieId } = req.params;

  try {
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

export default router;
