import { PrismaClient } from '@prisma/client';
import axios from "axios";

const prisma = new PrismaClient();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function seedMovies() {

  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is missing");
  }

  const res = await fetch(
    `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
  );

  const data = await res.json();

/*
for (const item of data.results) {
  const detailRes = await axios.get(
    `https://api.themoviedb.org/3/movie/${item.id}`,
    {
      params: {
        api_key: process.env.TMDB_API_KEY
      }
    }
  );

  const movie = detailRes.data;

  console.log(movie); 
}
*/

  for (const item of data.results) {

    const detailRes = await axios.get(
    `https://api.themoviedb.org/3/movie/${item.id}`,
    {
      params: {
        api_key: process.env.TMDB_API_KEY
      }
    }
  );

  const movie = detailRes.data;

    await prisma.movie.upsert({
      where: { 
        tmdbId: movie.id 
    },
      update: {
        overview: movie.overview ?? null,
        runtime: movie.runtime ?? null,
        homepage: movie.homepage ?? null,
        imdbId: movie.imdb_id ?? null,
        popularity: movie.popularity ?? null,
        voteAverage: movie.vote_average ?? null,
        posterPath: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null,
        backdropPath: movie.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
            : null,
        releaseDate: movie.release_date
          ? Number(movie.release_date.split("-")[0])
          : null
      },
      create: {
        tmdbId: movie.id,
        title: movie.title,
        overview: movie.overview ?? null,
        runtime: movie.runtime ?? null,
        homepage: movie.homepage ?? null,
        imdbId: movie.imdb_id ?? null,
        popularity: movie.popularity ?? null,
        voteAverage: movie.vote_average ?? null,
        posterPath: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null,
        backdropPath: movie.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
            : null,
        releaseDate: movie.release_date
            ? Number(movie.release_date.split("-")[0])
            : null
      },
    });
  }

  console.log(`Seeded ${data.results.length} movies`);
}

async function seedUsers() {
    
    const user = await prisma.user.upsert({
        where: { email: "dev@example.com" },
        update: {},
        create: {
            email: "dev@example.com",
        },
    });

    await prisma.watchlist.upsert({
        where: { id: "default-watchlist" },
        update: {},
        create: {
            id: "default-watchlist",
            name: "My Watchlist",
            userId: user.id,
        },
    });
}



async function main() {
    
  console.log('Seeding database...');

  // Clean up existing data (optional, safe for dev only)
  await prisma.rating.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.movieGenre.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.user.deleteMany();

  await seedMovies();
  await seedUsers();  
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
