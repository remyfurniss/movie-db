import { PrismaClient } from '@prisma/client';
import axios from "axios";

const prisma = new PrismaClient();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is missing");
  }

async function seedMovies() {

  

    const popularRes = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
    params: {
      api_key: TMDB_API_KEY,
      language: "en-US",
      page: 1,
    },
  });


  /*
  const res = await fetch(
    `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
  );

  const data = await res.json();
*/

  for (const item of popularRes.data.results) {

    const detailRes = await axios.get(
    `https://api.themoviedb.org/3/movie/${item.id}`,
    {
      params: {
        api_key: TMDB_API_KEY
      }
    }
  );

  const movie = detailRes.data;

  /*
  // ✅ FIRST ensure genres exist
  for (const g of movie.genres) {
      await prisma.genre.upsert({
        where: { tmdbId: g.id },
        update: {},
        create: {
          tmdbId: g.id,
          name: g.name
        }
      });
    }
*/




// ✅ Upsert movie WITHOUT genres first
    const dbMovie = await prisma.movie.upsert({
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
          : null,
        voteCount: movie.vote_count,
  
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
            : null,
        voteCount: movie.vote_count,
      },
    });

     // ✅ Remove old relations (important for reseeding)
    await prisma.movieGenre.deleteMany({
      where: { movieId: dbMovie.id }
    });

    // ✅ Recreate relations
    for (const genre of movie.genres) {

      const genreRecord = await prisma.genre.upsert({
        where: { tmdbId: genre.id },
        update: { name: genre.name }, // keeps name updated
    create: {
      tmdbId: genre.id,
      name: genre.name,
    },
 
      });

  


    await prisma.movieGenre.create({
        data: {
          movieId: dbMovie.id,
          genreId: genreRecord.id, // ✅ USE UUID HERE
        },
      });
    
    }

  }

  console.log(`Seeded ${popularRes.data.results.length} movies`);
}

async function seedWishlists() {
    
    await prisma.watchlist.upsert({
        where: { id: "My Watchlist" },
        update: {},
        create: {
            id: "default-watchlist",
            name: "My Watchlist",
        },
    });
}



async function main() {
    
  console.log('Seeding database...');

  // Clean up existing data (optional, safe for dev only)
  
 await prisma.watchlistItem.deleteMany();
await prisma.watchlist.deleteMany();
await prisma.rating.deleteMany();
  await prisma.movieGenre.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.genre.deleteMany();

  await seedMovies();
  await seedWishlists();  
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
