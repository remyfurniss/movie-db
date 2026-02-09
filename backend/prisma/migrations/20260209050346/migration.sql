/*
  Warnings:

  - You are about to drop the column `userId` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Watchlist` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[movieId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Watchlist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_userId_fkey";

-- DropForeignKey
ALTER TABLE "Watchlist" DROP CONSTRAINT "Watchlist_userId_fkey";

-- DropIndex
DROP INDEX "Rating_userId_movieId_key";

-- DropIndex
DROP INDEX "Watchlist_userId_name_key";

-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "userId",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Watchlist" DROP COLUMN "userId";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "UserRole";

-- CreateIndex
CREATE UNIQUE INDEX "Rating_movieId_key" ON "Rating"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_name_key" ON "Watchlist"("name");
