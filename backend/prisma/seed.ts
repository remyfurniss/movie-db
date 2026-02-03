import { PrismaClient } from "@prisma/client";

console.log("PrismaClient import OK");

const prisma = new PrismaClient();

console.log("PrismaClient constructed OK");

process.exit(0);
