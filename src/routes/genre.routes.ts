import { Router } from "express";
import {
  createGenre,
  deleteGenre,
  getAllGenres,
  getGenreById,
  updateGenre,
} from "../controller/genre.controller";
import { isAdmin } from "../middleware/is-admin";

const genreRouter = Router();

genreRouter.get("/", getAllGenres);
genreRouter.get("/:id", getGenreById);
genreRouter.post("/", createGenre);
genreRouter.patch("/:id", updateGenre);
genreRouter.delete("/:id", deleteGenre);

export default genreRouter;
