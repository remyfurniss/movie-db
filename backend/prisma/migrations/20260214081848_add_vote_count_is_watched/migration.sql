-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "voteCount" INTEGER,
ADD COLUMN     "watched" BOOLEAN NOT NULL DEFAULT false;
