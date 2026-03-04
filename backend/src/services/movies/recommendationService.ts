import prisma from "../../prismaClient";
import { getRecommendationsForMovie } from "../tmdb/tmdbService";

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