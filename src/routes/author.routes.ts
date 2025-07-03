import express from "express";
import { createAuthor, deleteAuthor, getAllAuthors, getAuthorById, updateAuthor } from "../controller/author.controller";
import { isAdmin } from "../middleware/is-admin";


const authorRouter = express.Router();

authorRouter.post("/", isAdmin,createAuthor);
authorRouter.get("/", getAllAuthors);
authorRouter.get("/:id", getAuthorById);
authorRouter.put("/:id",isAdmin, updateAuthor);
authorRouter.delete("/:id",isAdmin, deleteAuthor);

export default authorRouter;
