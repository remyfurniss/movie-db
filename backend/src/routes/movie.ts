import { Router } from "express";
import prisma from "../prismaClient";
import axios from "axios";
import { Prisma } from "@prisma/client"; 
import {getOrCreateMovie} from "../services/getOrCreateMovie"


const router = Router();


// GET /movies/tmdb/:tmdbId
router.get("/tmdb/:tmdbId", async (req, res) => {
  const tmdbId = Number(req.params.tmdbId);

   // check local DB first (WITH RELATIONS)
  const localMovie = await prisma.movie.findUnique({
    where: { tmdbId },
    include: {
      genres: {
        include: {
          genre: true,
        },
      },
    },
  });


  if (localMovie) {
    return res.json({
      ...localMovie,
      // flatten MovieGenre -> Genre
      genres: localMovie.genres.map((mg) => mg.genre),
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

  console.log(m);

  // normalize but DO NOT save
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
    genres: m.genres?.map((g: any) => ({
      id: g.id,
      name: g.name,
    })) ?? [],
    runtime: m.runtime,
    homepage: m.homepage,
    imdbId: m.imdb_id,
    voteCount: m.vote_count,
    popularity: m.popularity,
  });

});


/*
// GET /movies/tmdb/:tmdbId
router.get("/tmdb/:tmdbId", async (req, res) => {

  try {
    const tmdbId = Number(req.params.tmdbId);

    if (Number.isNaN(tmdbId)) {
      return res.status(400).json({ error: "Invalid tmdbId" });
    }

    // ✅ strongly typed include
    const movieInclude = Prisma.validator<Prisma.MovieInclude>()({
      genres: { include: { genre: true } },
    });

    // ✅ properly typed variable
    let movie: Prisma.MovieGetPayload<{
      include: typeof movieInclude;
    }> | null = await prisma.movie.findUnique({
      where: { tmdbId },
      include: movieInclude,
    });

    // ==============================
    // If NOT in DB → fetch from TMDB
    // ==============================
    if (!movie) {
      const token = process.env.TMDB_TOKEN;

      if (!token) {
        return res.status(500).json({ error: "TMDB token missing" });
      }

      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${tmdbId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      // ✅ create movie
      await prisma.movie.create({
        data: {
          tmdbId,
          title: data.title,
          overview: data.overview,
          releaseDate: data.release_date
            ? Number(data.release_date.slice(0, 4))
            : null,
          runtime: data.runtime,
          homepage: data.homepage,
          imdbId: data.imdb_id,
          popularity: data.popularity,
          posterPath: data.poster_path
            ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
            : null,
          backdropPath: data.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`
            : null,
          voteAverage: data.vote_average,
          voteCount: data.vote_count
                },
      });

      // ✅ insert genres (safe upsert)
      if (data.genres?.length) {
        const createdMovie = await prisma.movie.findUnique({
          where: { tmdbId },
        });

        if (createdMovie) {
          for (const g of data.genres) {
            const genre = await prisma.genre.upsert({
              where: { tmdbId: g.id },
              update: {},
              create: {
                tmdbId: g.id,
                name: g.name,
              },
            });

            await prisma.movieGenre.upsert({
              where: {
                movieId_genreId: {
                  movieId: createdMovie.id,
                  genreId: genre.id,
                },
              },
              update: {},
              create: {
                movieId: createdMovie.id,
                genreId: genre.id,
              },
            });
          }
        }
      }

      //  re-fetch with genres
      movie = await prisma.movie.findUnique({
        where: { tmdbId },
        include: movieInclude,
      });
    }

    if (!movie) {
      return res.status(500).json({ error: "Movie creation failed" });
    }

    //  flatten genres for frontend
    return res.json({
      ...movie,
      genres: movie.genres.map((mg) => mg.genre),
    });
  } catch (err) {
    console.error("TMDB movie route error:", err);
    return res.status(500).json({ error: "Failed to fetch movie" });
  }

});
*/


router.put("/:tmdbId/watched", async (req, res) => {
  try {
    const tmdbId = Number(req.params.tmdbId);

    if (Number.isNaN(tmdbId)) {
      return res.status(400).json({ error: "Invalid tmdbId" });
    }

    // ✅ ensures movie exists in DB
    const movie = await getOrCreateMovie(tmdbId);

    // ✅ toggle watched
    const updatedMovie = await prisma.movie.update({
      where: { id: movie.id }, // ← use DB id here
      data: {
        watched: !movie.watched,
      },
    });

    res.json(updatedMovie);
  } catch (err: any) {
    console.error("Toggle watched error:", err);
    res.status(500).json({ error: err.message });
  }
});


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



export default router;
