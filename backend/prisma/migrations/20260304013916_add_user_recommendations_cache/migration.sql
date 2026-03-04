-- CreateTable
CREATE TABLE "CachedUserRecommendations" (
    "userId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CachedUserRecommendations_pkey" PRIMARY KEY ("userId")
);
