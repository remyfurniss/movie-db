import prisma from "../prismaClient";
import { fetchPopularMoviesFromTMDB } from "./tmdbService";

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