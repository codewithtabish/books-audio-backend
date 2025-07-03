// import { Request, Response } from "express";
// import { prisma } from "../lib/db";
// import { Prisma } from "@prisma/client";
// import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
// // CREATE BOOK
// import { slugify, generateUniqueBookSlug } from "../utils/slugify"; // adjust path

// export const createBook = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const {
//       title,
//       author,
//       narrator,
//       genreType,
//       language,
//       bookCoverUrl,
//       bookBannerUrl,
//       description,
//       bookTotalTiming,
//       publishedAt,
//     } = req.body;

//     const missingFields: string[] = [];
//     if (!title) missingFields.push("title");
//     if (!author) missingFields.push("author");
//     if (!narrator) missingFields.push("narrator");
//     if (!genreType) missingFields.push("genreType");
//     if (!language) missingFields.push("language");
//     if (!bookCoverUrl) missingFields.push("bookCoverUrl");
//     if (!bookBannerUrl) missingFields.push("bookBannerUrl");
//     if (!bookTotalTiming) missingFields.push("bookTotalTiming");

//     if (missingFields.length > 0) {
//       return res.status(400).json({
//         status: false,
//         statusCode: 400,
//         message: "Missing required fields",
//         missingFields,
//       });
//     }

//     const timing = parseInt(bookTotalTiming);
//     if (isNaN(timing) || timing <= 0) {
//       return res.status(400).json({
//         status: false,
//         statusCode: 400,
//         message: "bookTotalTiming must be a valid positive number.",
//       });
//     }

//     let parsedDate: Date | null = null;
//     if (publishedAt) {
//       const date = new Date(publishedAt);
//       if (isNaN(date.getTime())) {
//         return res.status(400).json({
//           status: false,
//           statusCode: 400,
//           message: "Invalid publishedAt date format.",
//         });
//       }
//       parsedDate = date;
//     }

//     // Generate unique slug
//     const slug = await generateUniqueBookSlug(title);

//     const book = await prisma.book.create({
//       data: {
//         title,
//         slug,
//         author,
//         narrator,
//         genreType,
//         language,
//         bookCoverUrl,
//         bookBannerUrl,
//         description,
//         bookTotalTiming: timing,
//         publishedAt: parsedDate,
//       },
//     });

//     return res.status(201).json({
//       status: true,
//       statusCode: 201,
//       message: "Book created successfully 📚",
//       book,
//     });

//   } catch (error: any) {
//     console.error("❌ Error creating book:", error);

//     if (
//       error instanceof Prisma.PrismaClientKnownRequestError &&
//       error.code === "P2002"
//     ) {
//       return res.status(409).json({
//         status: false,
//         statusCode: 409,
//         message: "Duplicate value for a unique field.",
//         meta: error.meta,
//       });
//     }

//     if (error.code === 'ECONNREFUSED' || error.message?.includes("getaddrinfo ENOTFOUND")) {
//       return res.status(503).json({
//         status: false,
//         statusCode: 503,
//         message: "Database connection failed. Please try again later.",
//       });
//     }

//     return res.status(500).json({
//       status: false,
//       statusCode: 500,
//       message: "Internal server error while creating book.",
//       error: error.message || "Unknown error",
//     });
//   }
// };


// // GET ALL BOOKS
// export const getAllBooks = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const books = await prisma.book.findMany({
//         include:{
//             chapters:true
//         },
//         orderBy:{
//             createdAt:"desc"
//         }
//     });

//     return res.status(200).json({
//       status: true,
//       statusCode: 200,
//       message: "All books retrieved successfully",
//       books,
//     });

//   } catch (error: any) {
//     console.error("❌ Error fetching books:", error);

//     if (error instanceof PrismaClientKnownRequestError) {
//       return res.status(500).json({
//         status: false,
//         statusCode: 500,
//         message: "Database error occurred.",
//         code: error.code,
//         meta: error.meta,
//       });
//     }

//     if (error.code === 'ECONNREFUSED' || error.message?.includes("getaddrinfo ENOTFOUND")) {
//       return res.status(503).json({
//         status: false,
//         statusCode: 503,
//         message: "Cannot connect to the database. Please try again later.",
//       });
//     }

//     return res.status(500).json({
//       status: false,
//       statusCode: 500,
//       message: "Unexpected error while fetching books.",
//       error: error.message || "Unknown error",
//     });
//   }
// };





// export const getBookBySlug = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { slug } = req.params;

//     if (!slug) {
//       return res.status(400).json({
//         status: false,
//         statusCode: 400,
//         message: "Missing book slug in request parameters.",
//       });
//     }

//     const book = await prisma.book.findUnique({
//       where: { slug },
//     });

//     if (!book) {
//       return res.status(404).json({
//         status: false,
//         statusCode: 404,
//         message: "Book not found with the provided slug.",
//       });
//     }

//     return res.status(200).json({
//       status: true,
//       statusCode: 200,
//       message: "Book retrieved successfully",
//       book,
//     });

//   } catch (error: any) {
//     console.error("❌ Error fetching book by slug:", error);

//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       return res.status(500).json({
//         status: false,
//         statusCode: 500,
//         message: "Database error occurred.",
//         code: error.code,
//         meta: error.meta,
//       });
//     }

//     if (error.code === 'ECONNREFUSED' || error.message?.includes("getaddrinfo ENOTFOUND")) {
//       return res.status(503).json({
//         status: false,
//         statusCode: 503,
//         message: "Cannot connect to the database. Please try again later.",
//       });
//     }

//     return res.status(500).json({
//       status: false,
//       statusCode: 500,
//       message: "Unexpected error occurred while retrieving book.",
//     });
//   }
// };




// export const deleteBook = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { bookId } = req.params;

//     if (!bookId) {
//       return res.status(400).json({
//         status: false,
//         statusCode: 400,
//         message: "Missing bookId in request parameters.",
//       });
//     }

//     // Check if the book exists
//     const book = await prisma.book.findUnique({
//       where: { id: bookId },
//     });

//     if (!book) {
//       return res.status(404).json({
//         status: false,
//         statusCode: 404,
//         message: "Book not found. Invalid bookId.",
//       });
//     }

//     // Delete the book
//     await prisma.book.delete({
//       where: { id: bookId },
//     });

//     return res.status(200).json({
//       status: true,
//       statusCode: 200,
//       message: "Book deleted successfully.",
//       bookId,
//     });
//   } catch (error: any) {
//     console.error("❌ Error deleting book:", error);

//     // Prisma known error
//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       return res.status(500).json({
//         status: false,
//         statusCode: 500,
//         message: "Database error occurred.",
//         code: error.code,
//         meta: error.meta,
//       });
//     }

//     // Network/connection errors
//     if (error.code === "ECONNREFUSED" || error.message?.includes("getaddrinfo ENOTFOUND")) {
//       return res.status(503).json({
//         status: false,
//         statusCode: 503,
//         message: "Cannot connect to the database. Please try again later.",
//       });
//     }

//     // Unknown/unexpected errors
//     return res.status(500).json({
//       status: false,
//       statusCode: 500,
//       message: "Unexpected error occurred while deleting book.",
//       error: error.message || "Unknown error",
//     });
//   }
// };





// export const updateBook = async (req: Request, res: Response):Promise<any> => {
//   const { bookId:id } = req.params;
//   const {
//     title,
//     author,
//     narrator,
//     genreType,
//     language,
//     bookCoverUrl,
//     bookBannerUrl,
//     description,
//     bookTotalTiming,
//     publishedAt,
//     slug,
//   } = req.body;

//   // 1. Input validation (expand as needed)
//   if (!id || typeof id !== "string") {
//     return res.status(400).json({
//       status: false,
//       statusCode: 400,
//       reason: "Invalid or missing book ID.",
//       error: "Invalid or missing book ID.",
//     });
//   }
//   if (title && typeof title !== "string") {
//     return res.status(400).json({
//       status: false,
//       statusCode: 400,
//       reason: "Title must be a string.",
//       error: "Title must be a string.",
//     });
//   }
//   // Add more validation as needed

//   try {
//     // 2. Check if the book exists
//     const existingBook = await prisma.book.findUnique({ where: { id } });
//     if (!existingBook) {
//       return res.status(404).json({
//         status: false,
//         statusCode: 404,
//         reason: "Book not found.",
//         error: "Book not found.",
//       });
//     }

//     // 3. Attempt to update the book
//     const updatedBook = await prisma.book.update({
//       where: { id },
//       data: {
//         title,
//         author,
//         narrator,
//         genreType,
//         language,
//         bookCoverUrl,
//         bookBannerUrl,
//         description,
//         bookTotalTiming,
//         publishedAt: publishedAt ? new Date(publishedAt) : undefined,
//         slug,
//       },
//     });

//     return res.status(200).json({
//       status: true,
//       statusCode: 200,
//       reason: "Book updated successfully.",
//       data: updatedBook,
//     });
//   } catch (error: any) {
//     // Prisma known errors
//     if (error.code === "P2025") {
//       return res.status(404).json({
//         status: false,
//         statusCode: 404,
//         reason: "Book not found (Prisma).",
//         error: "Book not found (Prisma).",
//       });
//     }
//     if (error.code === "P2002") {
//       return res.status(409).json({
//         status: false,
//         statusCode: 409,
//         reason: "Unique constraint failed. Duplicate value.",
//         error: "Unique constraint failed. Duplicate value.",
//       });
//     }
//     if (error.code === "P2024") {
//       return res.status(503).json({
//         status: false,
//         statusCode: 503,
//         reason: "Database connection pool exhausted. Try again later.",
//         error: "Database connection pool exhausted. Try again later.",
//       });
//     }
//     // Network/DB connection errors
//     if (error.message && error.message.includes("ECONNREFUSED")) {
//       return res.status(503).json({
//         status: false,
//         statusCode: 503,
//         reason: "Database connection refused.",
//         error: "Database connection refused.",
//       });
//     }
//     if (error.message && error.message.includes("timeout")) {
//       return res.status(504).json({
//         status: false,
//         statusCode: 504,
//         reason: "Database request timed out.",
//         error: "Database request timed out.",
//       });
//     }
//     // Unexpected errors
//     console.error("❌ Error updating book:", error);
//     return res.status(500).json({
//       status: false,
//       statusCode: 500,
//       reason: "An unexpected error occurred.",
//       error: error.message || "An unexpected error occurred.",
//     });
//   }
// };


