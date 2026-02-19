import prisma from "../prismaClient";
import axios from "axios";
import { Prisma } from "@prisma/client";

export async function getOrCreateMovie(tmdbId: number) {
  const movieInclude = Prisma.validator<Prisma.MovieInclude>()({
    genres: { include: { genre: true } },
  });

  // 🔎 check local DB
  let movie = await prisma.movie.findUnique({
    where: { tmdbId },
    include: movieInclude,
  });

  if (movie) return movie;

  // 🌐 fetch from TMDB
  const token = process.env.TMDB_TOKEN;

  const response = await axios.get(
    `https://api.themoviedb.org/3/movie/${tmdbId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = response.data;

  console.log("genre data:")
  console.log(data.genres)

  // 🧱 create movie
  const createdMovie = await prisma.movie.create({
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
      watchHistory: data.watch_history,
    },
  });

  // genres
  if (data.genres?.length) {
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

  // 🔁 refetch fully hydrated
  movie = await prisma.movie.findUnique({
    where: { tmdbId },
    include: movieInclude,
  });

  return movie!;
}