import { Request, Response } from "express";
import { prisma } from "../lib/db";
import { redis } from "../lib/redis";
import { RedisKeys } from "../config/redis-key";

// Helper function to send consistent responses
const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data: any = null,
  error: string | null = null
) => {
  return res.status(statusCode).json({ status: success, message, data, error });
};
export const createGenre = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return sendResponse(res, 400, false, "Genre name is required and must be a string");
    }

    // Check if genre already exists
    const existing = await prisma.genre.findUnique({ where: { name } });
    if (existing) {
      return sendResponse(res, 409, false, "Genre already exists");
    }

    // Create new genre
    const genre = await prisma.genre.create({ data: { name } });

    // Invalidate relevant cache keys
    await Promise.all([
      redis.del(RedisKeys.ALL_GENRES),
      redis.set(RedisKeys.GENRE_DETAIL(genre.id), genre),
    ]);

    // Refresh all genres into Redis cache
    const genres = await prisma.genre.findMany();
    await redis.set(RedisKeys.ALL_GENRES, genres);

    return sendResponse(res, 201, true, "Genre created successfully", genre);
  } catch (error: any) {
    console.error("❌ DB Error in createGenre:", error);
    return sendResponse(
      res,
      500,
      false,
      "Failed to create genre",
      null,
      error instanceof Error ? error.message : String(error)
    );
  }
};


export const getAllGenres = async (_req: Request, res: Response): Promise<any> => {
  try {
    const cachedGenres = await redis.get(RedisKeys.ALL_GENRES);
    console.log("cachedGenres",cachedGenres)

    // ✅ cachedGenres is already an array/object if using @upstash/redis
    if (cachedGenres && Array.isArray(cachedGenres)) {
      return sendResponse(res, 200, true, "Genres (from cache) fetched successfully", cachedGenres);
    }

    const genres = await prisma.genre.findMany();

    await redis.set(RedisKeys.ALL_GENRES, genres); // ✅ No need to stringify

    return sendResponse(res, 200, true, "Genres fetched successfully", genres);
  } catch (error: any) {
    console.error("❌ Error in getAllGenres:", error);
    return sendResponse(res, 500, false, "Failed to fetch genres", null, error.message);
  }
};

// --- Get Single Genre ---
// --- Get Single Genre by ID ---
export const getGenreById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const cacheKey = RedisKeys.GENRE_DETAIL(id);

    const cachedGenre = await redis.get(cacheKey);

    // 🧠 @upstash/redis returns parsed object, no need to JSON.parse
    if (cachedGenre && typeof cachedGenre === "object") {
      return sendResponse(res, 200, true, "Genre (from cache) fetched successfully", cachedGenre);
    }

    // Fallback: fetch from DB
    const genre = await prisma.genre.findUnique({ where: { id } });

    if (!genre) {
      return sendResponse(res, 404, false, "Genre not found");
    }

    // ✅ No need to stringify if using @upstash/redis
    await redis.set(cacheKey, genre);

    return sendResponse(res, 200, true, "Genre fetched successfully", genre);
  } catch (error: any) {
    console.error("❌ Error in getGenreById:", error);
    return sendResponse(
      res,
      500,
      false,
      "Failed to fetch genre",
      null,
      error instanceof Error ? error.message : String(error)
    );
  }
};


export const updateGenre = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return sendResponse(res, 400, false, "Genre name is required and must be a string");
    }

    // Update in DB
    const updated = await prisma.genre.update({
      where: { id },
      data: { name },
    });

    // Invalidate relevant Redis keys
    await Promise.all([
      redis.del(RedisKeys.ALL_GENRES),
      redis.del(RedisKeys.GENRE_DETAIL(id)),
    ]);

    // Refresh cache for all genres and this one genre
    const genres = await prisma.genre.findMany();
    await Promise.all([
      redis.set(RedisKeys.ALL_GENRES, genres),
      redis.set(RedisKeys.GENRE_DETAIL(id), updated),
    ]);

    return sendResponse(res, 200, true, "Genre updated successfully", updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return sendResponse(res, 404, false, "Genre not found");
    }

    console.error("❌ DB Error in updateGenre:", error);
    return sendResponse(
      res,
      500,
      false,
      "Failed to update genre",
      null,
      error instanceof Error ? error.message : String(error)
    );
  }
};


export const deleteGenre = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    // First, check if genre exists
    const genre = await prisma.genre.findUnique({ where: { id } });
    if (!genre) {
      return sendResponse(res, 404, false, "Genre not found");
    }

    // Delete from DB
    await prisma.genre.delete({ where: { id } });

    // Invalidate specific genre detail + refresh all genres list
    await Promise.all([
      redis.del(RedisKeys.GENRE_DETAIL(id)),
      redis.del(RedisKeys.ALL_GENRES),
    ]);

    // Re-cache the updated genre list
    const updatedGenres = await prisma.genre.findMany();
    await redis.set(RedisKeys.ALL_GENRES, updatedGenres);

    return sendResponse(res, 200, true, "Genre deleted successfully");
  } catch (error: any) {
    console.error("❌ DB Error in deleteGenre:", error);

    return sendResponse(
      res,
      500,
      false,
      "Failed to delete genre",
      null,
      error instanceof Error ? error.message : String(error)
    );
  }
};

