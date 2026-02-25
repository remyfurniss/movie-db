/*
  Warnings:

  - A unique constraint covering the columns `[userId,movieId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,name]` on the table `Watchlist` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `Rating` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Watchlist` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_userId_fkey";

-- DropForeignKey
ALTER TABLE "Watchlist" DROP CONSTRAINT "Watchlist_userId_fkey";

-- DropIndex
DROP INDEX "Rating_movieId_key";

-- DropIndex
DROP INDEX "Watchlist_name_key";

-- AlterTable
ALTER TABLE "Rating" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Watchlist" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Rating_userId_movieId_key" ON "Rating"("userId", "movieId");

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_userId_name_key" ON "Watchlist"("userId", "name");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
