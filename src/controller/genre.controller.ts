import { Request, Response } from "express";
import { prisma } from "../lib/db";

// Helper function to send consistent responses
const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data: any = null,
  error: any = null
) => {
  return res.status(statusCode).json({ status: success, message, data, error });
};

// --- Create Genre ---
export const createGenre = async (req: Request, res: Response):Promise<any> => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return sendResponse(res, 400, false, "Genre name is required and must be a string");
    }

    const existing = await prisma.genre.findUnique({ where: { name } });
    if (existing) {
      return sendResponse(res, 409, false, "Genre already exists");
    }

    const genre = await prisma.genre.create({
      data: { name },
    });

    return sendResponse(res, 201, true, "Genre created successfully", genre);
  } catch (error: any) {
    console.error("❌ DB Error in createGenre:", error);
    return sendResponse(res, 500, false, "Failed to create genre", null, error.message);
  }
};

// --- Get All Genres ---
export const getAllGenres = async (_req: Request, res: Response):Promise<any> => {
  try {
    const genres = await prisma.genre.findMany();
    return sendResponse(res, 200, true, "Genres fetched successfully", genres);
  } catch (error: any) {
    console.error("❌ DB Error in getAllGenres:", error);
    return sendResponse(res, 500, false, "Failed to fetch genres", null, error.message);
  }
};

// --- Get Single Genre ---
export const getGenreById = async (req: Request, res: Response):Promise<any> => {
  try {
    const { id } = req.params;
    const genre = await prisma.genre.findUnique({ where: { id } });

    if (!genre) {
      return sendResponse(res, 404, false, "Genre not found");
    }

    return sendResponse(res, 200, true, "Genre fetched successfully", genre);
  } catch (error: any) {
    console.error("❌ DB Error in getGenreById:", error);
    return sendResponse(res, 500, false, "Failed to fetch genre", null, error.message);
  }
};

// --- Update Genre ---
export const updateGenre = async (req: Request, res: Response):Promise<any> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return sendResponse(res, 400, false, "Genre name is required and must be a string");
    }

    const updated = await prisma.genre.update({
      where: { id },
      data: { name },
    });

    return sendResponse(res, 200, true, "Genre updated successfully", updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return sendResponse(res, 404, false, "Genre not found");
    }
    console.error("❌ DB Error in updateGenre:", error);
    return sendResponse(res, 500, false, "Failed to update genre", null, error.message);
  }
};

// --- Delete Genre ---
export const deleteGenre = async (req: Request, res: Response):Promise<any> => {
  try {
    const { id } = req.params;

    await prisma.genre.delete({ where: { id } });

    return sendResponse(res, 200, true, "Genre deleted successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return sendResponse(res, 404, false, "Genre not found");
    }
    console.error("❌ DB Error in deleteGenre:", error);
    return sendResponse(res, 500, false, "Failed to delete genre", null, error.message);
  }
};
