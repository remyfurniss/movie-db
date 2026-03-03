/*
  Warnings:

  - You are about to drop the `WatchlistItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WatchlistItem" DROP CONSTRAINT "WatchlistItem_movieId_fkey";

-- DropForeignKey
ALTER TABLE "WatchlistItem" DROP CONSTRAINT "WatchlistItem_watchlistId_fkey";

-- DropTable
DROP TABLE "WatchlistItem";

-- CreateTable
CREATE TABLE "WatchlistMovie" (
    "watchlistId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchlistMovie_pkey" PRIMARY KEY ("watchlistId","movieId")
);

-- AddForeignKey
ALTER TABLE "WatchlistMovie" ADD CONSTRAINT "WatchlistMovie_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "Watchlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistMovie" ADD CONSTRAINT "WatchlistMovie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
