// routes/chapter.routes.ts
import { Router } from "express";
import {
  createChapterWithAudio,
  getAllChapters,
  getChapterById,
  updateChapterById,
  deleteChapterById,
} from "../controller/chatpter.controller";
// import upload from "../middleware/uploadToS3"; // If you want to handle file uploads

const chapterRouter = Router();

// Create chapter
chapterRouter.post("/create-chapter", createChapterWithAudio);

// Get all chapters
chapterRouter.get("/", getAllChapters);

// Get chapter by ID
chapterRouter.get("/:id", getChapterById);

// Update chapter by ID
chapterRouter.put("/:id", updateChapterById);

// Delete chapter by ID
chapterRouter.delete("/:id", deleteChapterById);

export default chapterRouter;
