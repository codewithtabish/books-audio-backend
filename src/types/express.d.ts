// express.d.ts or types/express/index.d.ts

// import { User } from "@prisma/client"; // or your own user type

export {}; // Ensure this file is treated as a module

declare global {
  namespace Express {
    interface Request {
      user?: {
        clerkId: string;
        email: string;
        username: string;
        role: "ADMIN" | "USER";
        // add other fields as needed
      };
    }
  }
}
