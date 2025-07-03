import { Request, Response, NextFunction } from "express";
import { verifyToken, users } from "@clerk/clerk-sdk-node";

// Import UserPayload type to ensure consistency with global Express types
// import type { UserPayload } from "../types/express";

// Define UserRole type (adjust as needed)
type UserRole = "USER" | "ADMIN" ;

export const requireAuthMiddleware = async (req: Request, res: Response, next: NextFunction):Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({status:false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify the Clerk session token (second argument is required)
  const payload = await verifyToken(token, {
  issuer: process.env.CLERK_ISSUER_URL!,
});


    // Fetch user info from Clerk
    const user = await users.getUser(payload.sub);

    req.user = {
      clerkId: payload.sub,
      email: user.emailAddresses[0]?.emailAddress,
      username: user.username,
      role: (user.publicMetadata?.role as UserRole) || "USER", // Ensure role is of type UserRole
    } as Express.Request["user"];

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
