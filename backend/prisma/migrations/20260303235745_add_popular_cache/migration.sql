-- CreateTable
CREATE TABLE "CachedPopularMovies" (
    "id" TEXT NOT NULL DEFAULT 'popular',
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CachedPopularMovies_pkey" PRIMARY KEY ("id")
);
