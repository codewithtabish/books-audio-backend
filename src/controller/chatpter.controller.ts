import { Request, Response } from "express";
import { prisma } from "../lib/db";
import { generateUniqueChapterSlug } from "../utils/slugify";

// --- Utility ---
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// --- CREATE ---
export const createChapterWithAudio = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, summary, order, duration, audioUrl, bookId } = req.body;

    // Collect missing fields
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

    // Type and value validation
    if (typeof title !== "string" || title.trim().length < 2 || title.length > 200) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        reason: "Title must be a string between 2 and 200 characters.",
        error: "Invalid title.",
      });
    }
    if (typeof summary !== "string" || summary.trim().length < 5 || summary.length > 2000) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        reason: "Summary must be a string between 5 and 2000 characters.",
        error: "Invalid summary.",
      });
    }

    const chapterOrder = Number(order);
    const chapterDuration = Number(duration);

    if (!Number.isInteger(chapterOrder) || chapterOrder < 1) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        reason: "Order must be a positive integer.",
        error: "Invalid order.",
      });
    }
    if (!Number.isInteger(chapterDuration) || chapterDuration < 1) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        reason: "Duration must be a positive integer.",
        error: "Invalid duration.",
      });
    }

    if (typeof audioUrl !== "string" || !isValidUrl(audioUrl)) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        reason: "Audio URL must be a valid URL.",
        error: "Invalid audioUrl.",
      });
    }

    if (typeof bookId !== "string" || bookId.length < 5) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        reason: "bookId must be a valid string.",
        error: "Invalid bookId.",
      });
    }

    // Check if the book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        reason: "Book not found. Invalid bookId.",
        error: "Book not found.",
      });
    }

    // Generate unique slug for chapter
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

    return res.status(201).json({
      status: true,
      statusCode: 201,
      reason: "Chapter created successfully.",
      data: chapter,
    });
  } catch (error: any) {
    // Prisma known errors
    if (error.code === "P2002") {
      return res.status(409).json({
        status: false,
        statusCode: 409,
        reason: "Unique constraint failed. Duplicate value.",
        error: "Unique constraint failed. Duplicate value.",
      });
    }
    if (error.code === "P2025") {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        reason: "Record not found.",
        error: "Record not found.",
      });
    }
    if (error.code === "P2024") {
      return res.status(503).json({
        status: false,
        statusCode: 503,
        reason: "Database connection pool exhausted. Try again later.",
        error: "Database connection pool exhausted. Try again later.",
      });
    }
    if (error.message && error.message.includes("ECONNREFUSED")) {
      return res.status(503).json({
        status: false,
        statusCode: 503,
        reason: "Database connection refused.",
        error: "Database connection refused.",
      });
    }
    if (error.message && error.message.includes("timeout")) {
      return res.status(504).json({
        status: false,
        statusCode: 504,
        reason: "Database request timed out.",
        error: "Database request timed out.",
      });
    }
    // Unexpected errors
    console.error("❌ Unhandled upload error:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      reason: "Internal server error during chapter upload.",
      error: error.message || "Internal server error during chapter upload.",
    });
  }
};

// --- GET ALL CHAPTERS ---
export const getAllChapters = async (req: Request, res: Response): Promise<any> => {
  try {
    const chapters = await prisma.chapter.findMany({
      orderBy: { order: "asc" },
    });

    return res.status(200).json({
      status: true,
      statusCode: 200,
      reason: "All chapters retrieved successfully.",
      data: chapters,
    });
  } catch (error: any) {
    if (error.code && error.code.startsWith("P")) {
      return res.status(500).json({
        status: false,
        statusCode: 500,
        reason: "Database error occurred.",
        error: error.message,
        code: error.code,
        meta: error.meta,
      });
    }
    if (error.code === 'ECONNREFUSED' || error.message?.includes("getaddrinfo ENOTFOUND")) {
      return res.status(503).json({
        status: false,
        statusCode: 503,
        reason: "Cannot connect to the database. Please try again later.",
      });
    }
    return res.status(500).json({
      status: false,
      statusCode: 500,
      reason: "Unexpected error while fetching chapters.",
      error: error.message || "Unknown error",
    });
  }
};

// --- GET CHAPTER BY ID ---
export const getChapterById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        reason: "Invalid or missing chapter ID.",
        error: "Invalid or missing chapter ID.",
      });
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id },
    });

    if (!chapter) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        reason: "Chapter not found.",
        error: "Chapter not found.",
      });
    }

    return res.status(200).json({
      status: true,
      statusCode: 200,
      reason: "Chapter retrieved successfully.",
      data: chapter,
    });
  } catch (error: any) {
    if (error.code && error.code.startsWith("P")) {
      return res.status(500).json({
        status: false,
        statusCode: 500,
        reason: "Database error occurred.",
        error: error.message,
        code: error.code,
        meta: error.meta,
      });
    }
    if (error.code === 'ECONNREFUSED' || error.message?.includes("getaddrinfo ENOTFOUND")) {
      return res.status(503).json({
        status: false,
        statusCode: 503,
        reason: "Cannot connect to the database. Please try again later.",
      });
    }
    return res.status(500).json({
      status: false,
      statusCode: 500,
      reason: "Unexpected error while fetching chapter.",
      error: error.message || "Unknown error",
    });
  }
};

// --- UPDATE CHAPTER BY ID ---
export const updateChapterById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { title, summary, order, duration, audioUrl } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        reason: "Invalid or missing chapter ID.",
        error: "Invalid or missing chapter ID.",
      });
    }

    // Validate fields if present
    if (title !== undefined && (typeof title !== "string" || title.trim().length < 2 || title.length > 200)) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        reason: "Title must be a string between 2 and 200 characters.",
        error: "Invalid title.",
      });
    }
    if (summary !== undefined && (typeof summary !== "string" || summary.trim().length < 5 || summary.length > 2000)) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        reason: "Summary must be a string between 5 and 2000 characters.",
        error: "Invalid summary.",
      });
    }
    if (order !== undefined && (!Number.isInteger(Number(order)) || Number(order) < 1)) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        reason: "Order must be a positive integer.",
        error: "Invalid order.",
      });
    }
    if (duration !== undefined && (!Number.isInteger(Number(duration)) || Number(duration) < 1)) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        reason: "Duration must be a positive integer.",
        error: "Invalid duration.",
      });
    }
    if (audioUrl !== undefined && (typeof audioUrl !== "string" || !isValidUrl(audioUrl))) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        reason: "Audio URL must be a valid URL.",
        error: "Invalid audioUrl.",
      });
    }

    // Check if chapter exists
    const existing = await prisma.chapter.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        reason: "Chapter not found.",
        error: "Chapter not found.",
      });
    }

    // If title is updated, generate a new unique slug
    let slug: string | undefined = undefined;
    if (title && title !== existing.title) {
      slug = await generateUniqueChapterSlug(title);
    }

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

    return res.status(200).json({
      status: true,
      statusCode: 200,
      reason: "Chapter updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({
        status: false,
        statusCode: 409,
        reason: "Unique constraint failed. Duplicate value.",
        error: "Unique constraint failed. Duplicate value.",
      });
    }
    if (error.code === "P2025") {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        reason: "Record not found.",
        error: "Record not found.",
      });
    }
    if (error.code === "P2024") {
      return res.status(503).json({
        status: false,
        statusCode: 503,
        reason: "Database connection pool exhausted. Try again later.",
        error: "Database connection pool exhausted. Try again later.",
      });
    }
    if (error.message && error.message.includes("ECONNREFUSED")) {
      return res.status(503).json({
        status: false,
        statusCode: 503,
        reason: "Database connection refused.",
        error: "Database connection refused.",
      });
    }
    if (error.message && error.message.includes("timeout")) {
      return res.status(504).json({
        status: false,
        statusCode: 504,
        reason: "Database request timed out.",
        error: "Database request timed out.",
      });
    }
    return res.status(500).json({
      status: false,
      statusCode: 500,
      reason: "Unexpected error while updating chapter.",
      error: error.message || "Unknown error",
    });
  }
};

// --- DELETE CHAPTER BY ID ---
export const deleteChapterById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        reason: "Invalid or missing chapter ID.",
        error: "Invalid or missing chapter ID.",
      });
    }

    // Check if chapter exists
    const existing = await prisma.chapter.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        reason: "Chapter not found.",
        error: "Chapter not found.",
      });
    }

    await prisma.chapter.delete({ where: { id } });

    return res.status(200).json({
      status: true,
      statusCode: 200,
      reason: "Chapter deleted successfully.",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        reason: "Record not found.",
        error: "Record not found.",
      });
    }
    if (error.code === "P2024") {
      return res.status(503).json({
        status: false,
        statusCode: 503,
        reason: "Database connection pool exhausted. Try again later.",
        error: "Database connection pool exhausted. Try again later.",
      });
    }
    if (error.message && error.message.includes("ECONNREFUSED")) {
      return res.status(503).json({
        status: false,
        statusCode: 503,
        reason: "Database connection refused.",
        error: "Database connection refused.",
      });
    }
    if (error.message && error.message.includes("timeout")) {
      return res.status(504).json({
        status: false,
        statusCode: 504,
        reason: "Database request timed out.",
        error: "Database request timed out.",
      });
    }
    return res.status(500).json({
      status: false,
      statusCode: 500,
      reason: "Unexpected error while deleting chapter.",
      error: error.message || "Unknown error",
    });
  }
};

