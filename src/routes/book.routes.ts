// routes/chapter.routes.ts
import { Router } from "express";
// import { createBook, deleteBook, getAllBooks, getBookBySlug, updateBook,  } from "../controller/book.controller";
import { checkLanguageMiddleware } from "../middleware/check-auth-middleware";
// import upload from "../middleware/uploadToS3";

const bookRouter = Router();

// bookRouter.post("/create-book", checkLanguageMiddleware,createBook);

// bookRouter.get('/',getAllBooks)



// ✅ Add this route to get a book by its ID
// bookRouter.get("/:slug", getBookBySlug);


// bookRouter.delete("/:bookId", deleteBook);


// Update a book by its ID
// bookRouter.put("/:bookId", updateBook);





export default bookRouter;
