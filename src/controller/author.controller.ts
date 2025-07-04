import { Request, Response } from "express";
import { prisma } from "../lib/db";
import { redis } from "../lib/redis";
import { RedisKeys } from "../config/redis-key";

// Helper function for response
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

// ✅ Create Author (Admin)
export const createAuthor = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, authorPorfile } = req.body;

    if (!name || !authorPorfile) {
      return sendResponse(res, 400, false, "Name and profile image are required");
    }

    const author = await prisma.author.create({ data: { name, authorPorfile } });

    await Promise.all([
      redis.del(RedisKeys.ALL_AUTHORS),
      redis.set(RedisKeys.AUTHOR_DETAIL(author.id), author),
    ]);

    // Refresh the full list
    const authors = await prisma.author.findMany({
      include: { _count: { select: { followers: true, books: true } } },
      orderBy: { name: "asc" },
    });
    await redis.set(RedisKeys.ALL_AUTHORS, authors);

    return sendResponse(res, 201, true, "Author created successfully", author);
  } catch (error: any) {
    console.error("❌ DB Error in createAuthor:", error);
    return sendResponse(res, 500, false, "Failed to create author", null, error.message);
  }
};

// ✅ Get All Authors (with Redis)
export const getAllAuthors = async (_req: Request, res: Response): Promise<any> => {
  try {
    const cached = await redis.get(RedisKeys.ALL_AUTHORS);

    if (cached && Array.isArray(cached)) {
      return sendResponse(res, 200, true, "Authors (from cache) fetched successfully", cached);
    }

    const authors = await prisma.author.findMany({
      include: { _count: { select: { followers: true, books: true } } },
      orderBy: { name: "asc" },
    });

    await redis.set(RedisKeys.ALL_AUTHORS, authors);
    return sendResponse(res, 200, true, "Authors fetched successfully", authors);
  } catch (error: any) {
    console.error("❌ Error in getAllAuthors:", error);
    return sendResponse(res, 500, false, "Failed to fetch authors", null, error.message);
  }
};

// ✅ Get Author by ID
export const getAuthorById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const cacheKey = RedisKeys.AUTHOR_DETAIL(id);

    const cached = await redis.get(cacheKey);

    if (cached && typeof cached === "object") {
      return sendResponse(res, 200, true, "Author (from cache) fetched successfully", cached);
    }

    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        _count: { select: { followers: true, books: true } },
        books: {
          select: {
            id: true,
            title: true,
            slug: true,
            bookCoverUrl: true,
            publishedAt: true,
          },
        },
      },
    });

    if (!author) {
      return sendResponse(res, 404, false, "Author not found");
    }

    await redis.set(cacheKey, author);
    return sendResponse(res, 200, true, "Author fetched successfully", author);
  } catch (error: any) {
    console.error("❌ Error in getAuthorById:", error);
    return sendResponse(res, 500, false, "Failed to get author", null, error.message);
  }
};

// ✅ Update Author
export const updateAuthor = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, authorPorfile } = req.body;

    const updated = await prisma.author.update({
      where: { id },
      data: { name, authorPorfile },
    });

    await Promise.all([
      redis.del(RedisKeys.ALL_AUTHORS),
      redis.set(RedisKeys.AUTHOR_DETAIL(id), updated),
    ]);

    const authors = await prisma.author.findMany({
      include: { _count: { select: { followers: true, books: true } } },
      orderBy: { name: "asc" },
    });

    await redis.set(RedisKeys.ALL_AUTHORS, authors);

    return sendResponse(res, 200, true, "Author updated successfully", updated);
  } catch (error: any) {
    console.error("❌ Error in updateAuthor:", error);
    return sendResponse(res, 500, false, "Failed to update author", null, error.message);
  }
};

// ✅ Delete Author
export const deleteAuthor = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    await prisma.author.delete({ where: { id } });

    await Promise.all([
      redis.del(RedisKeys.AUTHOR_DETAIL(id)),
      redis.del(RedisKeys.ALL_AUTHORS),
    ]);

    const authors = await prisma.author.findMany({
      include: { _count: { select: { followers: true, books: true } } },
      orderBy: { name: "asc" },
    });

    await redis.set(RedisKeys.ALL_AUTHORS, authors);

    return sendResponse(res, 200, true, "Author deleted successfully", authors);
  } catch (error: any) {
    console.error("❌ Error in deleteAuthor:", error);
    return sendResponse(res, 500, false, "Failed to delete author", null, error.message);
  }
};
