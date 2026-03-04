import prisma from "../../prismaClient";
import { getRecommendationsForMovie } from "../tmdb/tmdbService";

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function buildRecommendations(userId: string) {
  const watched = await prisma.watchHistory.findMany({
    where: { userId },
    orderBy: { watchedAt: "desc" },
    take: 8,
    select: {
      movie: { select: { tmdbId: true } },
    },
  });

  const tmdbIds = watched.map(w => w.movie.tmdbId);

  if (tmdbIds.length === 0) return [];

  const watchedSet = new Set(tmdbIds);

  const results = await Promise.all(
    tmdbIds.map(id => getRecommendationsForMovie(id))
  );

  const flat = results.flat();

  const filtered = flat.filter(m => !watchedSet.has(m.id));

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
  // 1️⃣ check cache
  const cache = await prisma.cachedUserRecommendations.findUnique({
    where: { userId },
  });

  if (cache && cache.expiresAt > new Date()) {
    const cachedData = cache.data as any[];

    // return cached if enough
    if (cachedData.length >= 20) return cachedData.slice(0, 20);

    // otherwise enrich with fresh recommendations
    const fresh = await buildRecommendations(userId);
    const combinedMap = new Map();
    [...cachedData, ...fresh].forEach((m) => combinedMap.set(m.tmdbId, m));

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

  // 2️⃣ no cache or expired
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