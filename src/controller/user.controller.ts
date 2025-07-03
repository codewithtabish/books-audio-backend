import { Request, Response } from "express";
import { prisma } from "../lib/db";

type UserRole = "USER" | "ADMIN";

interface UserUpsertBody {
  clerkId: string;
  email: string;
  userName: string;
  preferredAuthors?: string[];
  preferredGenres?: string[];
  isOnBoardedComplete?: boolean;
    role?: UserRole;

}

interface UpdateUserBody {
  userName?: string;
  preferredAuthors?: string[];
  preferredGenres?: string[];
  isOnBoardedComplete?: boolean;
}

// --- Helper for standard API response ---
const sendResponse = (
  res: Response,
  statusCode: number,
  status: boolean,
  message: string,
  data: any = null,
  error: any = null
) => {
  return res.status(statusCode).json({ status, message, data, error });
};

// --- 1. Create or Update User ---
export const createOrUpdateUser = async (req: Request, res: Response):Promise<any> => {
  try {
    const {
      clerkId,
      email,
      userName,
      preferredAuthors = [],
      preferredGenres = [],
      isOnBoardedComplete = false,
      role = "USER", // Default to USER

    }: UserUpsertBody = req.body;

    if (!clerkId || !email || !userName) {
      return sendResponse(res, 400, false, "clerkId, email, and userName are required");
    }

    const validAuthors = await prisma.author.findMany({
      where: { id: { in: preferredAuthors } },
      select: { id: true },
    });

    const validGenres = await prisma.genre.findMany({
      where: { id: { in: preferredGenres } },
      select: { id: true },
    });

    // if i have the user with the same id the just update , 
    // and if not then just create 
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {
        email,
        userName,
        isOnBoardedComplete,
        role,
        preferredAuthors: { set: [], connect: validAuthors },
        preferredGenres: { set: [], connect: validGenres },
      },
      create: {
        clerkId,
        email,
        userName,
        role,
        isOnBoardedComplete,
        preferredAuthors: { connect: validAuthors },
        preferredGenres: { connect: validGenres },
      },
      include: {
        preferredAuthors: true,
        preferredGenres: true,
      },
    });

    return sendResponse(res, 200, true, "User created or updated successfully", user);
  } catch (error: any) {
    console.error("createOrUpdateUser error:", error);
    return sendResponse(res, 500, false, "Server error", null, error.message);
  }
};

// --- 2. Get User by Clerk ID ---
export const getUserByClerkId = async (req: Request, res: Response):Promise<any> => {
  try {
    const { clerkId } = req.params;
    if (!clerkId) return sendResponse(res, 400, false, "clerkId is required");

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        preferredAuthors: true,
        preferredGenres: true,
        settings: true,
      },
    });

    if (!user) return sendResponse(res, 404, false, "User not found");
    return sendResponse(res, 200, true, "User fetched successfully", user);
  } catch (error: any) {
    console.error("getUserByClerkId error:", error);
    return sendResponse(res, 500, false, "Server error", null, error.message);
  }
};

// --- 3. Get All Users (Admin Only) ---
export const getAllUsers = async (_req: Request, res: Response):Promise<any> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        preferredAuthors: true,
        preferredGenres: true,
      },
    });
    return sendResponse(res, 200, true, "All users fetched", users);
  } catch (error: any) {
    console.error("getAllUsers error:", error);
    return sendResponse(res, 500, false, "Server error", null, error.message);
  }
};

// --- 4. Update User ---
export const updateUser = async (req: Request, res: Response):Promise<any> => {
  try {
    const { clerkId } = req.params;
    const {
      userName,
      preferredAuthors = [],
      preferredGenres = [],
      isOnBoardedComplete,
    }: UpdateUserBody = req.body;

    if (!clerkId) return sendResponse(res, 400, false, "clerkId is required");

    const validAuthors = await prisma.author.findMany({
      where: { id: { in: preferredAuthors } },
      select: { id: true },
    });

    const validGenres = await prisma.genre.findMany({
      where: { id: { in: preferredGenres } },
      select: { id: true },
    });

    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        userName,
        isOnBoardedComplete,
        preferredAuthors: { set: [], connect: validAuthors },
        preferredGenres: { set: [], connect: validGenres },
      },
      include: {
        preferredAuthors: true,
        preferredGenres: true,
      },
    });

    return sendResponse(res, 200, true, "User updated", user);
  } catch (error: any) {
    if (error.code === "P2025") return sendResponse(res, 404, false, "User not found");
    console.error("updateUser error:", error);
    return sendResponse(res, 500, false, "Server error", null, error.message);
  }
};

// --- 5. Delete User (Admin or Self) ---
export const deleteUser = async (req: Request, res: Response):Promise<any> => {
  try {
    const { clerkId } = req.params;
    const currentUser = req.user;

    if (!clerkId) return sendResponse(res, 400, false, "clerkId is required");

    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.clerkId !== clerkId)) {
      return sendResponse(res, 403, false, "Forbidden: Cannot delete this user");
    }

    await prisma.user.delete({ where: { clerkId } });
    return sendResponse(res, 200, true, "User deleted");
  } catch (error: any) {
    if (error.code === "P2025") return sendResponse(res, 404, false, "User not found");
    console.error("deleteUser error:", error);
    return sendResponse(res, 500, false, "Server error", null, error.message);
  }
};

// --- 6. Set User Role (Admin only) ---
export const setUserRole = async (req: Request, res: Response):Promise<any> => {
  try {
    const { clerkId } = req.params;
    const { role } = req.body as { role: UserRole };

    if (!clerkId || !role) return sendResponse(res, 400, false, "clerkId and role required");
    if (!["USER", "ADMIN"].includes(role)) return sendResponse(res, 400, false, "Invalid role");

    const user = await prisma.user.update({
      where: { clerkId },
      data: { role },
    });

    return sendResponse(res, 200, true, "User role updated", user);
  } catch (error: any) {
    if (error.code === "P2025") return sendResponse(res, 404, false, "User not found");
    console.error("setUserRole error:", error);
    return sendResponse(res, 500, false, "Server error", null, error.message);
  }
};
