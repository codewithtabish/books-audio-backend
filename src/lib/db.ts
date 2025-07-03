import { PrismaClient } from "@prisma/client";

// Use globalThis for compatibility across environments
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Create a single instance of PrismaClient
export const prisma =
  globalForPrisma.prisma || new PrismaClient();

// In development, store the instance on the global object to prevent hot-reload issues
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
