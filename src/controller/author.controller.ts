// routes/author.routes.ts

import { Request, Response } from "express";
import { prisma } from "../lib/db";


const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data: any = null
) => {
  return res.status(statusCode).json({
    status: success ? "success" : "error",
    statusCode,
    success,
    message,
    data,
  });
};

// ✅ Create Author (Admin)
export const createAuthor = async (req: Request, res: Response):Promise<any> => {
  try {
    const { name, authorPorfile } = req.body;

    if (!name || !authorPorfile) {
      return sendResponse(res, 400, false, "Name and profile image are required");
    }

    const author = await prisma.author.create({
      data: { name, authorPorfile },
    });

    return sendResponse(res, 201, true, "Author created successfully", author);
  } catch (error: any) {
    return sendResponse(res, 500, false, "Failed to create author", error.message);
  }
};

// ✅ Get All Authors for all public
export const getAllAuthors = async (_req: Request, res: Response):Promise<any> => {
  try {
    const authors = await prisma.author.findMany({
      include: {
        _count: {
          select: {
            followers: true,
            books: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return sendResponse(res, 200, true, "Authors fetched successfully", authors);
  } catch (error: any) {
    return sendResponse(res, 500, false, "Failed to fetch authors", error.message);
  }
};

// ✅ Get Author all public
export const getAuthorById = async (req: Request, res: Response):Promise<any> => {
  try {
    const { id } = req.params;

    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            followers: true,
            books: true,
          },
        },
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

    return sendResponse(res, 200, true, "Author fetched successfully", author);
  } catch (error: any) {
    return sendResponse(res, 500, false, "Failed to get author", error.message);
  }
};

// ✅ Update Author (Admin)
export const updateAuthor = async (req: Request, res: Response):Promise<any> => {
  try {
    const { id } = req.params;
    const { name, authorPorfile } = req.body;

    const updated = await prisma.author.update({
      where: { id },
      data: { name, authorPorfile },
    });

    return sendResponse(res, 200, true, "Author updated successfully", updated);
  } catch (error: any) {
    return sendResponse(res, 500, false, "Failed to update author", error.message);
  }
};

// ✅ Delete Author (Admin)
export const deleteAuthor = async (req: Request, res: Response):Promise<any> => {
  try {
    const { id } = req.params;

    await prisma.author.delete({
      where: { id },
    });

    return sendResponse(res, 200, true, "Author deleted successfully");
  } catch (error: any) {
    return sendResponse(res, 500, false, "Failed to delete author", error.message);
  }
};
