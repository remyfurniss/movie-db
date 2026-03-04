import { Router } from "express";
import prisma from "../prismaClient";
import {getOrCreateMovie} from "../services/movies/movieService"
import {requireAuth } from "../middleware/auth";
import {getUserWatchlists, getWatchlistById, assertWatchlistOwnership} from "../services/watchlists/watchlistService";

const router = Router();

/**
 * Create a watchlist
 * body: { name }
 */
router.post("/", requireAuth, async (req, res) => {
  const {name} = req.body;
  const userId = req.userId
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!name) return res.status(400).json({ error: "name required" });
  try {
    const watchlist = await prisma.watchlist.create({
      data: { name, userId },
    });
    res.json(watchlist);
  } catch (err: any) {
    console.error("Create watchlist error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get a specific watchlist
 */
router.get("/:id", requireAuth, async (req, res) => {
  const userId = req.userId
  const id =  req.params.id as string;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const watchlist = await getWatchlistById(id, userId);
    res.json(watchlist);
  } catch (err: any) {
    console.error("Get specific watchlist error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get all watchlists
 */
router.get("/", requireAuth, async (req, res) => {
  const userId = req.userId
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const watchlists = await getUserWatchlists(userId);
    res.json(watchlists);
  } catch (err: any) {
    console.error("Get all watchlists error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Add movie to watchlist
 */
router.post("/:watchlistId/movies", requireAuth, async (req, res) => {
  const watchlistId = req.params.watchlistId as string;
  const userId = req.userId
  const tmdbId = Number(req.body.tmdbId);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (Number.isNaN(tmdbId)) return res.status(400).json({ error: "tmdbId required" });
  try {
    assertWatchlistOwnership(watchlistId, userId)
    const movie = await getOrCreateMovie(tmdbId);
    // create movie wacthlist relation
    await prisma.watchlistMovie.create({
      data: {
        watchlistId,
        movieId: movie.id,
      },
    });
    res.json({ message: "Movie added to watchlist" });
  } catch (err: any) {
    console.error("Add movie to watchlist error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Remove movie from watchlist
 */
router.delete("/:watchlistId/movies/:movieId", requireAuth, async (req, res) => {
  const watchlistId = req.params.watchlistId as string;
  const movieId = req.params.movieId as string;
  const userId = req.userId
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    assertWatchlistOwnership(watchlistId, userId)
    await prisma.watchlistMovie.delete({
      where: {
        watchlistId_movieId: { watchlistId, movieId },
      },
    });
    res.json({ message: "Movie removed from watchlist" });
  } catch (err: any) {
    console.error("Remove movie from watchlist error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * delete watchlist
 */
router.delete("/:watchlistId", requireAuth, async (req, res) => {
  const watchlistId = req.params.watchlistId as string;
  const userId = req.userId
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    assertWatchlistOwnership(watchlistId, userId)
    await prisma.watchlist.delete({
      where: { id: watchlistId },
    });
    res.json({ message: "Watchlist deleted" });
  }
  catch (err: any) {
    console.error("Delete watchlist error:", err);
    res.status(500).json({ error: err.message });
  } 
});

export default router;
