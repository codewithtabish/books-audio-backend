import { Router } from "express";


import { requireAuthMiddleware } from "../middleware/require-auth-middleware";
import { createOrUpdateUser, deleteUser, getAllUsers, getUserByClerkId, setUserRole, updateUser } from "../controller/user.controller";
import { isAdmin } from "../middleware/is-admin";

const userRouter = Router();

// Public or protected user creation/upsert
userRouter.post("/", createOrUpdateUser);

// Get user by clerkId (authenticated)
userRouter.get("/:clerkId", requireAuthMiddleware, getUserByClerkId);

// Update user profile
userRouter.put("/:clerkId", requireAuthMiddleware, updateUser);

// Get all users (Admin only)
userRouter.get("/", requireAuthMiddleware, isAdmin, getAllUsers);

// Delete user (Admin or self)
userRouter.delete("/:clerkId", requireAuthMiddleware, deleteUser);

// Update user role (Admin only)
userRouter.patch("/:clerkId/role", requireAuthMiddleware, isAdmin, setUserRole);

export default userRouter;
