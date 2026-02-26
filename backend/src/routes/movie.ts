import { Router } from "express";
import prisma from "../prismaClient";
import axios from "axios";
import {getOrCreateMovie} from "../services/getOrCreateMovie"
import {getRecommendationsForMovie} from "../services/getRecommendationsForMovie"
//import console from "node:console";
import {requireAuth } from "../middleware/auth";


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

  try {
    const watched = await prisma.watchHistory.findMany({
      where: { userId },
      orderBy: { watchedAt: "desc" },
      take: 8,
      select: {
        movie: { select: { tmdbId: true } },
      },
    });

    const tmdbIds = watched.map(w => w.movie.tmdbId);

    if (tmdbIds.length === 0) {
      return res.json([]);
    }

    const watchedSet = new Set(tmdbIds);

    const results = await Promise.all(
      tmdbIds.map(id => getRecommendationsForMovie(id))
    );

    const flat = results.flat();

    // remove already watched movies
    const filtered = flat.filter(m => !watchedSet.has(m.id));

    // dedupe
    const map = new Map();
    for (const m of filtered) {
      if (!map.has(m.id)) {
        map.set(m.id, m);
      }
    }

    const unique = Array.from(map.values());

    unique.sort(
      (a, b) =>
        (b.vote_average * b.vote_count) -
        (a.vote_average * a.vote_count)
    );

    const top20 = unique.slice(0, 20).map((m: any) => ({
      tmdbId: m.id,
      title: m.title,
      posterPath: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : null,
      voteAverage: m.vote_average,
      releaseDate: m.release_date
        ? Number(m.release_date.slice(0, 4))
        : null,
    }));

    res.json(top20);
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
    const tmdbId = Number(req.params.tmdbId);
    const userId = req.userId;

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

/*
router.get("/search", async (req, res) => {
  const q = req.query.q as string;

  if (!q) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const movies = await prisma.movie.findMany({
      where: {
        title: {
          contains: q,
          mode: "insensitive",
        },
      },
      take: 20,
    });

    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});
*/

/*
// Create a movie
router.post("/", async (req, res) => {
  const { title, director, releaseYear } = req.body;
  try {
    const movie = await prisma.movie.create({
      data: { title, director, releaseYear },
    });
    res.json(movie);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
*/

/*
// Get all movies
router.get("/", async (req, res) => {

  const search = req.query.search as string | undefined;

  const movies = await prisma.movie.findMany({
    where: search
      ? {
          title: {
            contains: search,
            mode: "insensitive",
          },
        }
      : undefined,
    orderBy: {
      title: "asc",
    },
    take: 50, // safety limit
  });

  res.json(movies);
});

// Get a movie by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Movie id is required" });
  }

  try {
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    // 🔥 Flatten MovieGenre -> Genre
    const formattedMovie = {
      ...movie,
      genres: movie.genres.map((mg) => mg.genre),
    };

    res.json(formattedMovie);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
*/

/*
// Update a movie
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, director, releaseYear } = req.body;
  try {
    const movie = await prisma.movie.update({
      where: { id },
      data: { title, director, releaseYear },
    });
    res.json(movie);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
*/

/*
// Delete a movie
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.movie.delete({ where: { id } });
    res.json({ message: "Movie deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
*/

export default router;
