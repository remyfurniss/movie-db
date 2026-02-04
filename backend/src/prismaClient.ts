import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); // <- NO PARAMETERS

console.log("Prisma models:", Object.keys(prisma));

export default prisma;
