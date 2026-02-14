import { Router } from "express";
import axios from "axios";

const router = Router();

router.get("/search", async (req, res) => {

    console.log("TMDB token exists:", !!process.env.TMDB_API_TOKEN);

    
  const q = req.query.q as string;

  if (!q) return res.status(400).json([]);

  const response = await axios.get(
    "https://api.themoviedb.org/3/search/movie",
    {
      params: {
        api_key: process.env.TMDB_API_KEY,
        query: q,
      },
    }
  );

  const movies = response.data.results.map((m: any) => ({
    tmdbId: m.id,
    title: m.title,
    posterPath: m.poster_path
      ? `https://image.tmdb.org/t/p/w200${m.poster_path}`
      : null,
    releaseDate: m.release_date
      ? Number(m.release_date.split("-")[0])
      : null,
  }));

  res.json(movies);
});

export default router;