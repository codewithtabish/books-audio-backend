import { Request, Response } from "express";
import { prisma } from "../lib/db";
import { redis } from "../lib/redis";
import { RedisKeys } from "../config/redis-key";
import { generateUniqueChapterSlug } from "../utils/slugify";

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const knownErrors: Record<string, [number, string]> = {
  P2002: [409, "Unique constraint failed. Duplicate value."],
  P2025: [404, "Record not found."],
  P2024: [503, "Database connection pool exhausted. Try again later."],
};

// --- CREATE CHAPTER ---
export const createChapterWithAudio = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, summary, order, duration, audioUrl, bookId } = req.body;

    const missingFields: string[] = [];
    if (!title) missingFields.push("title");
    if (!summary) missingFields.push("summary");
    if (order === undefined || order === null) missingFields.push("order");
    if (duration === undefined || duration === null) missingFields.push("duration");
    if (!audioUrl) missingFields.push("audioUrl");
    if (!bookId) missingFields.push("bookId");

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        reason: "Missing required fields.",
        error: `Missing fields: ${missingFields.join(", ")}`,
        missingFields,
      });
    }

    const chapterOrder = Number(order);
    const chapterDuration = Number(duration);
    const slug = await generateUniqueChapterSlug(title);

    const chapter = await prisma.chapter.create({
      data: {
        title,
        slug,
        summary,
        order: chapterOrder,
        duration: chapterDuration,
        audioUrl,
        bookId,
      },
    });

    await redis.del(RedisKeys.CHAPTERS_BY_BOOK(bookId));

    return res.status(201).json({
      status: true,
      statusCode: 201,
      reason: "Chapter created successfully.",
      data: chapter,
    });
  } catch (error: any) {
    if (error.code && knownErrors[error.code]) {
      const [statusCode, reason] = knownErrors[error.code];
      return res.status(statusCode).json({ status: false, statusCode, reason, error: reason });
    }
    if (error.message?.includes("ECONNREFUSED")) {
      return res.status(503).json({ status: false, statusCode: 503, reason: "Database connection refused.", error: "Database connection refused." });
    }
    if (error.message?.includes("timeout")) {
      return res.status(504).json({ status: false, statusCode: 504, reason: "Database request timed out.", error: "Database request timed out." });
    }
    console.error("❌ Unhandled upload error:", error);
    return res.status(500).json({ status: false, statusCode: 500, reason: "Internal server error during chapter upload.", error: error.message });
  }
};

// --- GET CHAPTERS BY BOOK ID (WITH REDIS) ---
export const getChaptersByBook = async (req: Request, res: Response): Promise<any> => {
  try {
    const { bookId } = req.params;
    if (!bookId) {
      return res.status(400).json({ status: false, statusCode: 400, reason: "Missing book ID." });
    }

    const cacheKey = RedisKeys.CHAPTERS_BY_BOOK(bookId);
    const cachedData = await redis.get(cacheKey);
    const parsed = typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
    if (parsed && Array.isArray(parsed)) {
      return res.status(200).json({ status: true, statusCode: 200, reason: "Chapters fetched from cache.", data: parsed });
    }

    const chapters = await prisma.chapter.findMany({
      where: { bookId },
      orderBy: { order: "asc" },
    });

    await redis.set(cacheKey, JSON.stringify(chapters));
    return res.status(200).json({ status: true, statusCode: 200, reason: "Chapters fetched successfully.", data: chapters });
  } catch (error: any) {
    return res.status(500).json({ status: false, statusCode: 500, reason: "Error fetching chapters.", error: error.message });
  }
};

// --- GET CHAPTER BY ID ---
export const getChapterById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const chapter = await prisma.chapter.findUnique({ where: { id } });

    if (!chapter) {
      return res.status(404).json({ status: false, statusCode: 404, reason: "Chapter not found.", error: "Chapter not found." });
    }

    return res.status(200).json({ status: true, statusCode: 200, reason: "Chapter fetched successfully.", data: chapter });
  } catch (error: any) {
    return res.status(500).json({ status: false, statusCode: 500, reason: "Error fetching chapter.", error: error.message });
  }
};

// --- UPDATE CHAPTER BY ID ---
export const updateChapterById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { title, summary, order, duration, audioUrl } = req.body;

    const existing = await prisma.chapter.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ status: false, statusCode: 404, reason: "Chapter not found.", error: "Chapter not found." });
    }

    const slug = title && title !== existing.title ? await generateUniqueChapterSlug(title) : existing.slug;

    const updated = await prisma.chapter.update({
      where: { id },
      data: {
        title,
        slug,
        summary,
        order: order !== undefined ? Number(order) : undefined,
        duration: duration !== undefined ? Number(duration) : undefined,
        audioUrl,
      },
    });

    await redis.del(RedisKeys.CHAPTERS_BY_BOOK(updated.bookId));

    return res.status(200).json({ status: true, statusCode: 200, reason: "Chapter updated successfully.", data: updated });
  } catch (error: any) {
    return res.status(500).json({ status: false, statusCode: 500, reason: "Error updating chapter.", error: error.message });
  }
};

// --- DELETE CHAPTER BY ID ---
export const deleteChapterById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const chapter = await prisma.chapter.findUnique({ where: { id } });
    if (!chapter) {
      return res.status(404).json({ status: false, statusCode: 404, reason: "Chapter not found.", error: "Chapter not found." });
    }

    await prisma.chapter.delete({ where: { id } });
    await redis.del(RedisKeys.CHAPTERS_BY_BOOK(chapter.bookId));

    return res.status(200).json({ status: true, statusCode: 200, reason: "Chapter deleted successfully." });
  } catch (error: any) {
    return res.status(500).json({ status: false, statusCode: 500, reason: "Error deleting chapter.", error: error.message });
  }
};



// --- GET ALL CHAPTERS ---
export const getAllChapters = async (req: Request, res: Response): Promise<any> => {
  try {
    const chapters = await prisma.chapter.findMany({

    
      // orderBy: { : 'desc' }, // or 'asc' if you prefer
    });

    return res.status(200).json({
      status: true,
      statusCode: 200,
      reason: 'All chapters fetched successfully.',
      data: chapters,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: false,
      statusCode: 500,
      reason: 'Error fetching all chapters.',
      error: error.message,
    });
  }
};


