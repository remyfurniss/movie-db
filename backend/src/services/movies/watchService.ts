import prisma from "../../prismaClient";
import {getOrCreateMovie} from "../movies/movieService";

export async function toggleWatched(userId: string, tmdbId: number) {
    // Get movie
    const movie = await getOrCreateMovie(tmdbId);
    const existing = await prisma.watchHistory.findUnique({
        where: {
        userId_movieId: {
            userId,
            movieId: movie.id,
        },
        },
    });
    let watched: boolean;
    // if wacthed before toggle to false else true
    if (existing) {
        await prisma.watchHistory.delete({
        where: {
            userId_movieId: {
            userId,
            movieId: movie.id,
            },
        },
        });
        watched = false;
    } else {
        await prisma.watchHistory.create({
        data: {
            userId,          
            movieId: movie.id,
        },
        });
        watched = true;
    }
    return {
        tmdbId: movie.tmdbId,
        title: movie.title,
        watched,
    };
}

export async function getRecentlyWatched(userId: string) {
    // Gete 20 most recently watched films
  const watched = await prisma.watchHistory.findMany({
    where: { userId },
    orderBy: { watchedAt: "desc" },
    take: 20,
    include: {
      movie: true,
    },
  });
  return watched.map((w) => ({
    tmdbId: w.movie.tmdbId,
    title: w.movie.title,
    posterPath: w.movie.posterPath,
    voteAverage: w.movie.voteAverage,
    releaseDate: w.movie.releaseDate,
  }));
}