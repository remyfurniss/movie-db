import prisma from "../../prismaClient";
import { Prisma } from "@prisma/client";

type WatchlistWithMovies = Prisma.WatchlistGetPayload<{
  include: {
    watchlistMovies: {
      include: { movie: true };
    };
  };
}>;

export function transformWatchlist(watchlist: WatchlistWithMovies) {
  //maps the watchlistmovies relation to its movie
  return {
    id: watchlist.id,
    name: watchlist.name,
    createdAt: watchlist.createdAt,
    movies: watchlist.watchlistMovies.map((wm) => wm.movie),
  };
}

export async function getWatchlistById(id: string, userId: string) {
  // Get watchlist by its watchlistId
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
  // Get all user watchlists
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
  // Ensure watchlist exists for user
  const watchlist = await prisma.watchlist.findFirst({ where: { id: watchlistId, userId } });
  if (!watchlist) throw new Error("Watchlist not found");
  return watchlist;
}