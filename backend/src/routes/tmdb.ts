import { Router } from "express";
import {getPopularMovies, searchMovies} from "../services/movies/movieService";

const router = Router();

/**
 * search movie by string (search bar)
 */
router.get("/search", async (req, res) => {
  const q = req.query.q as string;
  if (!q) return res.status(400).json([]);
  try {
    const movies = await searchMovies(q);
    res.json(movies);
  } catch (err: any) {
    console.error("Search error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * get popular movies
 */
router.get("/popular", async (req, res) => {
  try {
    const movies = await getPopularMovies();
    res.json(movies);
  } catch (err: any) {
    console.error("Get popular movies error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;