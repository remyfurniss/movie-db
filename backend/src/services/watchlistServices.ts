import prisma from "../prismaClient";
import { Prisma } from "@prisma/client";

type WatchlistWithMovies = Prisma.WatchlistGetPayload<{
  include: {
    watchlistMovies: {
      include: { movie: true };
    };
  };
}>;

export function transformWatchlist(watchlist: WatchlistWithMovies) {
  return {
    id: watchlist.id,
    name: watchlist.name,
    createdAt: watchlist.createdAt,
    movies: watchlist.watchlistMovies.map((wm) => wm.movie),
  };
}

export async function getWatchlistById(id: string, userId: string) {
  const watchlist = await prisma.watchlist.findFirst({
    where: { id, userId },
    include: {
      watchlistMovies: {
        include: { movie: true },
      },
    },
  });

  if (!watchlist) return null;

  return transformWatchlist(watchlist);
}

export async function getUserWatchlists(userId: string) {
  const watchlists = await prisma.watchlist.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      watchlistMovies: {
        include: { movie: true },
      },
    },
  });

  return watchlists.map(transformWatchlist);
}

export async function assertWatchlistOwnership(watchlistId: string, userId: string) {
  const watchlist = await prisma.watchlist.findFirst({ where: { id: watchlistId, userId } });
  if (!watchlist) throw new Error("Watchlist not found");
  return watchlist;
}