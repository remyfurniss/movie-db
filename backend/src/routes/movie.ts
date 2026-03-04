import { Router } from "express";
import {getMovieDetails} from "../services/movies/movieService";
import {requireAuth } from "../middleware/auth";
import {getUserRecommendations} from "../services/movies/recommendationService";
import {toggleWatched, getRecentlyWatched} from "../services/movies/watchService";

const router = Router();

router.get("/recentlywatched", requireAuth, async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const movies = await getRecentlyWatched(userId);
    res.json(movies);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/recommendations", requireAuth, async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try{
    const recommendations = await getUserRecommendations(userId);
    res.json(recommendations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/tmdb/:tmdbId", requireAuth, async (req, res) => {
  const tmdbId = Number(req.params.tmdbId);
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const movie = await getMovieDetails(tmdbId, userId);
    res.json(movie);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:tmdbId/watched", requireAuth, async (req, res) => {
  const tmdbId = Number(req.params.tmdbId);
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const result = await toggleWatched(userId, tmdbId);
    res.json(result);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
