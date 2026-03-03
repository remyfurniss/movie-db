import cron from "node-cron";
import prisma from "../prismaClient";

"*/10 * * * *"

export function startCleanupJob() {
  // Runs every day at 3am
  //cron.schedule("0 3 * * *", async () => {
  cron.schedule("*/1 * * * *", async () => {
    console.log("Running movie cleanup job...");

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