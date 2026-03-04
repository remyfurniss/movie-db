import { Router } from "express";
import prisma from "../prismaClient";
import axios from "axios";
import {getOrCreateMovie} from "../services/movies/movieService";
import {requireAuth } from "../middleware/auth";
import {buildRecommendations} from "../services/movies/recommendationService";


const router = Router();

// GET /movies/recentlywatched
router.get("/recentlywatched", requireAuth, async (req, res) => {
  const userId = req.userId;

  try {
    const watched = await prisma.watchHistory.findMany({
      where: { userId },
      orderBy: { watchedAt: "desc" },
      take: 20,
      include: {
        movie: true,
      },
    });

    const movies = watched.map((w) => ({
      tmdbId: w.movie.tmdbId,
      title: w.movie.title,
      posterPath: w.movie.posterPath,
      voteAverage: w.movie.voteAverage,
      releaseDate: w.movie.releaseDate,
    }));

    res.json(movies);
  } catch (err: any) {
    console.error("Recently watched error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/recommendations", requireAuth, async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const THIRTY_MINUTES = 30 * 60 * 1000;

  try {
    const cache = await prisma.cachedUserRecommendations.findUnique({
      where: { userId },
    });

    // Valid cache
    if (cache && cache.expiresAt > new Date()) {
      const cachedData = cache.data as any[];

      // Enough movies 
      if (cachedData.length >= 20) {
        return res.json(cachedData);
      }

      console.log(cachedData.length);

      // ENRICH
      const fresh = await buildRecommendations(userId);

      const combined = [...cachedData, ...fresh];

      const map = new Map();
      for (const m of combined) {
        if (!map.has(m.tmdbId)) {
          map.set(m.tmdbId, m);
        }
      }

      const final = Array.from(map.values())
        .sort((a, b) => b.voteAverage - a.voteAverage)
        .slice(0, 20);

      await prisma.cachedUserRecommendations.update({
        where: { userId },
        data: {
          data: final,
          expiresAt: new Date(Date.now() + THIRTY_MINUTES),
        },
      });

      return res.json(final);
    }

    // 🔵 No cache or expired 
    const fresh = await buildRecommendations(userId);

    const final = fresh.slice(0, 20);

    await prisma.cachedUserRecommendations.upsert({
      where: { userId },
      update: {
        data: final,
        expiresAt: new Date(Date.now() + THIRTY_MINUTES),
      },
      create: {
        userId,
        data: final,
        expiresAt: new Date(Date.now() + THIRTY_MINUTES),
      },
    });

    res.json(final);

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /movies/tmdb/:tmdbId
router.get("/tmdb/:tmdbId", requireAuth, async (req, res) => {
  const tmdbId = Number(req.params.tmdbId);
  const userId = req.userId;

  try {
    // check local DB first (WITH RELATIONS)
    const localMovie = await prisma.movie.findUnique({
      where: { tmdbId },
      include: {
        genres: {
          include: { genre: true },
        },
        ratings: {
          where: { userId },
        },
        watchHistory: {
          where: { userId },
        },
      },
    });

    if (localMovie) {
      return res.json({
        ...localMovie,
        genres: localMovie.genres.map((mg) => mg.genre),
        rating: localMovie.ratings[0]?.score ?? null,
        watched: localMovie.watchHistory.length > 0,
      });
    }

    // fetch from TMDB
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbId}`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
        },
      }
    );

    const m = response.data;

    return res.json({
      tmdbId: m.id,
      title: m.title,
      posterPath: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : null,
      backdropPath: m.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}`
        : null,
      releaseDate: m.release_date
        ? Number(m.release_date.slice(0, 4))
        : null,
      overview: m.overview,
      voteAverage: m.vote_average,
      genres:
        m.genres?.map((g: any) => ({
          id: g.id,
          name: g.name,
        })) ?? [],
      runtime: m.runtime,
      homepage: m.homepage,
      imdbId: m.imdb_id,
      voteCount: m.vote_count,
      popularity: m.popularity,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:tmdbId/watched", requireAuth, async (req, res) => {
  try {

    const userId = req.userId;
    const tmdbId = Number(req.params.tmdbId);

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    if (Number.isNaN(tmdbId)) {
      return res.status(400).json({ error: "Invalid tmdbId" });
    }

    const movie = await getOrCreateMovie(tmdbId);

    const existing = await prisma.watchHistory.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId: movie.id,
        },
      },
    });

    let watched: boolean;

    if (existing) {
      await prisma.watchHistory.delete({
        where: {
          userId_movieId: {
            userId,
            movieId: movie.id,
          },
        },
      });
      watched = false;
    } else {
      await prisma.watchHistory.create({
        data: {
          userId,          
          movieId: movie.id,
        },
      });
      watched = true;
    }

    res.json({
      tmdbId: movie.tmdbId,
      title: movie.title,
      watched,
    });
  } catch (err: any) {
    console.error("Toggle watched error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
