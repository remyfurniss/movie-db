import prisma from "../../prismaClient";
import { getRecommendationsForMovie } from "../tmdb/tmdbService";

// 30 minutes
const CACHE_DURATION = 30 * 60 * 1000;

export async function buildRecommendations(userId: string) {
  // Get 8 most recently watched films 
  const watched = await prisma.watchHistory.findMany({
    where: { userId },
    orderBy: { watchedAt: "desc" },
    take: 8,
    select: {
      movie: { select: { tmdbId: true } },
    },
  });
  // Get their tmdfbIds
  const tmdbIds = watched.map(w => w.movie.tmdbId);
  if (tmdbIds.length === 0) return [];
  const watchedSet = new Set(tmdbIds);
  // Get recommendations for each movie in set
  const results = await Promise.all(
    tmdbIds.map(id => getRecommendationsForMovie(id))
  );
  const flat = results.flat();
  // Remove movie if already watched
  const filtered = flat.filter(m => !watchedSet.has(m.id));
  const map = new Map();
  for (const m of filtered) {
    if (!map.has(m.id)) {
      map.set(m.id, m);
    }
  }
  const unique = Array.from(map.values());
  // Sort by rating
  unique.sort(
    (a, b) =>
      b.vote_average - a.vote_average
  );
  return unique.map((m: any) => ({
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
}

export async function getUserRecommendations(userId: string) {
  // Check cache
  const cache = await prisma.cachedUserRecommendations.findUnique({
    where: { userId },
  });
  // If in cache and not expired
  if (cache && cache.expiresAt > new Date()) {
    const cachedData = cache.data as any[];
    // if atleast 20 movies cache return it
    if (cachedData.length >= 20) return cachedData.slice(0, 20);
    // otherwise add more recommendations
    const fresh = await buildRecommendations(userId);
    const combinedMap = new Map();
    [...cachedData, ...fresh].forEach((m) => combinedMap.set(m.tmdbId, m));
    // sort by ratings and take top 20
    const final = Array.from(combinedMap.values())
      .sort((a, b) => b.voteAverage - a.voteAverage)
      .slice(0, 20);
    // update cache
    await prisma.cachedUserRecommendations.update({
      where: { userId },
      data: {
        data: final,
        expiresAt: new Date(Date.now() + CACHE_DURATION),
      },
    });
    return final;
  }
  // no cache or expired
  const fresh = await buildRecommendations(userId);
  const final = fresh.slice(0, 20);
  await prisma.cachedUserRecommendations.upsert({
    where: { userId },
    update: {
      data: final,
      expiresAt: new Date(Date.now() + CACHE_DURATION),
    },
    create: {
      userId,
      data: final,
      expiresAt: new Date(Date.now() + CACHE_DURATION),
    },
  });
  return final;
}