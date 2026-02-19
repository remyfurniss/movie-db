/*
  Warnings:

  - You are about to drop the column `tmdbId` on the `WatchHistory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[movieId]` on the table `WatchHistory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `movieId` to the `WatchHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "WatchHistory_tmdbId_idx";

-- AlterTable
ALTER TABLE "WatchHistory" DROP COLUMN "tmdbId",
ADD COLUMN     "movieId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "WatchHistory_movieId_key" ON "WatchHistory"("movieId");

-- AddForeignKey
ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
