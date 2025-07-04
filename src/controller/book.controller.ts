import { Request, Response } from "express";
import { prisma } from "../lib/db";
import { redis } from "../lib/redis";
import { RedisKeys } from "../config/redis-key";
import { slugify } from "../utils/slugify";

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

// ✅ Create Book
export const createBook = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      title,
      bookCoverUrl,
      bookBannerUrl,
      narrator,
      description,
      bookTotalTiming,
      publishedAt,
      authorId,
      genreId,
    } = req.body;

    if (!title || !bookCoverUrl || !narrator || !bookTotalTiming || !authorId || !genreId) {
      return sendResponse(res, 400, false, "Required fields are missing");
    }

    const slug = slugify(title);
    const book = await prisma.book.create({
      data: {
        title,
        slug,
        bookCoverUrl,
        bookBannerUrl,
        narrator,
        description,
        bookTotalTiming,
        publishedAt,
        authorId,
        genreId,
      },
    });

    await Promise.all([
      redis.del(RedisKeys.ALL_BOOKS),
      redis.set(RedisKeys.BOOK_DETAIL(book.id), book),
    ]);

    const books = await prisma.book.findMany({
      include: { author: true, genre: true },
      orderBy: { createdAt: "desc" },
    });
    await redis.set(RedisKeys.ALL_BOOKS, books);

    return sendResponse(res, 201, true, "Book created successfully", book);
  } catch (error: any) {
    console.error("❌ Error in createBook:", error);
    return sendResponse(res, 500, false, "Failed to create book", null, error.message);
  }
};

// ✅ Get All Books
export const getAllBooks = async (_req: Request, res: Response): Promise<any> => {
  try {
    const cached = await redis.get(RedisKeys.ALL_BOOKS);

    if (cached && Array.isArray(cached)) {
      return sendResponse(res, 200, true, "Books (from cache) fetched", cached);
    }

    const books = await prisma.book.findMany({
      include: { author: true, genre: true },
      orderBy: { createdAt: "desc" },
    });

    await redis.set(RedisKeys.ALL_BOOKS, books);
    return sendResponse(res, 200, true, "Books fetched", books);
  } catch (error: any) {
    console.error("❌ Error in getAllBooks:", error);
    return sendResponse(res, 500, false, "Failed to fetch books", null, error.message);
  }
};
export const getBookBySlug = async (req: Request, res: Response): Promise<any> => {
  try {
    const { slug } = req.params;
    const cacheKey = RedisKeys.BOOK_DETAIL_BY_SLUG(slug);

    const cached = await redis.get(cacheKey);

    if (cached && typeof cached === "object") {
      return sendResponse(res, 200, true, "Book (from cache) fetched", cached);
    }

    const book = await prisma.book.findUnique({
      where: { slug },
      include: {
        author: true,
        genre: true,
        chapters: true,
        _count: { select: { reviews: true, downloads: true, bookmarks: true } },
      },
    });

    if (!book) return sendResponse(res, 404, false, "Book not found");

    await redis.set(cacheKey, book);
    return sendResponse(res, 200, true, "Book fetched", book);
  } catch (error: any) {
    console.error("❌ Error in getBookBySlug:", error);
    return sendResponse(res, 500, false, "Failed to get book", null, error.message);
  }
};


// ✅ Update Book
export const updateBook = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.title) updateData.slug = slugify(updateData.title);

    const updated = await prisma.book.update({
      where: { id },
      data: updateData,
    });

    await Promise.all([
      redis.del(RedisKeys.ALL_BOOKS),
      redis.set(RedisKeys.BOOK_DETAIL(id), updated),
    ]);

    const books = await prisma.book.findMany({
      include: { author: true, genre: true },
      orderBy: { createdAt: "desc" },
    });
    await redis.set(RedisKeys.ALL_BOOKS, books);

    return sendResponse(res, 200, true, "Book updated successfully", updated);
  } catch (error: any) {
    console.error("❌ Error in updateBook:", error);
    return sendResponse(res, 500, false, "Failed to update book", null, error.message);
  }
};

// ✅ Delete Book
export const deleteBook = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    await prisma.book.delete({ where: { id } });

    await Promise.all([
      redis.del(RedisKeys.BOOK_DETAIL(id)),
      redis.del(RedisKeys.ALL_BOOKS),
    ]);

    const books = await prisma.book.findMany({
      include: { author: true, genre: true },
      orderBy: { createdAt: "desc" },
    });
    await redis.set(RedisKeys.ALL_BOOKS, books);

    return sendResponse(res, 200, true, "Book deleted successfully", books);
  } catch (error: any) {
    console.error("❌ Error in deleteBook:", error);
    return sendResponse(res, 500, false, "Failed to delete book", null, error.message);
  }
};
