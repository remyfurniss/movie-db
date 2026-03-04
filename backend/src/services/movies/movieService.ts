import prisma from "../../prismaClient";
import { Prisma } from "@prisma/client";
import { fetchPopularMoviesFromTMDB } from "../tmdb/tmdbService";
import axios from "axios";

const ONE_HOUR = 60 * 60 * 1000;

export async function getPopularMovies() {
  const cache = await prisma.cachedPopularMovies.findUnique({
    where: { id: "popular" },
  });

  // If cache exists and not expired return it
  if (cache && cache.expiresAt > new Date()) {
      return cache.data;
    }

  console.log("Fetching popular movies from TMDB");

  const movies = await fetchPopularMoviesFromTMDB();

  await prisma.cachedPopularMovies.upsert({
  where: { id: "popular" },
  update: {
    data: movies,
    expiresAt: new Date(Date.now() + ONE_HOUR),
  },
  create: {
    id: "popular",
    data: movies,
    expiresAt: new Date(Date.now() + ONE_HOUR),
  },
});

  return movies;
}

export async function getOrCreateMovie(tmdbId: number) {
  const movieInclude = Prisma.validator<Prisma.MovieInclude>()({
    genres: { include: { genre: true } },
  });

  // 1️⃣ Try to find existing
  const existing = await prisma.movie.findUnique({
    where: { tmdbId },
    include: movieInclude,
  });

  if (existing) return existing;

  const token = process.env.TMDB_TOKEN;

  const response = await axios.get(
    `https://api.themoviedb.org/3/movie/${tmdbId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = response.data;

  let movie;

  // 2️⃣ Try to create movie OUTSIDE transaction
  try {
    movie = await prisma.movie.create({
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
        voteCount: data.vote_count,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      // Someone else created it first
      movie = await prisma.movie.findUniqueOrThrow({
        where: { tmdbId },
      });
    } else {
      throw error;
    }
  }

  // 3️⃣ Now safely link genres in transaction
  await prisma.$transaction(async (tx) => {
    if (data.genres?.length) {
      const genres = await Promise.all(
        data.genres.map((g: any) =>
          tx.genre.upsert({
            where: { tmdbId: g.id },
            update: {},
            create: {
              tmdbId: g.id,
              name: g.name,
            },
          })
        )
      );

      await tx.movieGenre.createMany({
        data: genres.map((genre) => ({
          movieId: movie.id,
          genreId: genre.id,
        })),
        skipDuplicates: true,
      });
    }
  });

  return prisma.movie.findUniqueOrThrow({
    where: { tmdbId },
    include: movieInclude,
  });
}

export async function getMovieDetails(tmdbId: number, userId: string) {
  // check local DB
  const movie = await prisma.movie.findUnique({
    where: { tmdbId },
    include: {
      genres: { include: { genre: true } },
      ratings: { where: { userId } },
      watchHistory: { where: { userId } },
    },
  });

  if (movie) {
    return {
      ...movie,
      genres: movie.genres.map((mg) => mg.genre),
      rating: movie.ratings[0]?.score ?? null,
      watched: movie.watchHistory.length > 0,
    };
  }

  // fetch from TMDB
  const response = await axios.get(
    `https://api.themoviedb.org/3/movie/${tmdbId}`,
    { params: { api_key: process.env.TMDB_API_KEY } }
  );

  const m = response.data;

  // optionally create in DB so future requests hit local DB
  const created = await getOrCreateMovie(tmdbId); // uses your existing transaction logic

  return {
    ...created,
    genres: created.genres.map((mg) => mg.genre),
    rating: null,
    watched: false,
  };
}

export async function getRecentlyWatched(params:type) {}
