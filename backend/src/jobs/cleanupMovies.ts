import cron from "node-cron";
import prisma from "../prismaClient";

export function startCleanupJob() {
  // Runs every day at 3am
  cron.schedule("0 3 * * *", async () => {
    console.log("Running movie cleanup job...");
    //Remove movies with no rating, watchhistory, and movie watchlist realtions
    try {
      const deleted = await prisma.movie.deleteMany({
        where: {
          ratings: { none: {} },
          watchHistory: { none: {} },
          watchlistMovies: { none: {} },
        },
      });
      console.log(`Deleted ${deleted.count} unused movies`);
    } catch (err) {
      console.error("Cleanup failed:", err);
    }
  });
}