/*
  Warnings:

  - A unique constraint covering the columns `[tmdbId]` on the table `Genre` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tmdbId` to the `Genre` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Genre" ADD COLUMN     "tmdbId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Genre_tmdbId_key" ON "Genre"("tmdbId");
