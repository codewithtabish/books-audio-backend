import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/db";

declare global {
  namespace Express {
    interface Request {
      user?: {
        clerkId: string;
        email: string;
        username: string;
        role: "ADMIN" | "USER";
      };
    }
  }
}

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { clerkId, email } = req.body;

    // 1. Missing input
    if (!clerkId || !email) {
      return res.status(400).json({
        status: false,
        message: "clerkId and email are required in the request body",
      });
    }

    // 2. User not found
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found with provided clerkId",
      });
    }

    // 3. Email mismatch
    if (user.email !== email) {
      return res.status(401).json({
        status: false,
        message: "Email does not match the user associated with the clerkId",
      });
    }

    // 4. Not admin
    if (user.role !== "ADMIN") {
      return res.status(403).json({
        status: false,
        message: "Access denied: Only admins are allowed to perform this action",
      });
    }

    // 5. Success — attach user to request
    req.user = {
      clerkId: user.clerkId,
      email: user.email,
      username: user.userName,
      role: user.role,
    };

    next();
  } catch (error: any) {
    console.error("❌ Error in isAdmin middleware:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error?.message || "Unexpected failure in admin check",
    });
  }
};
