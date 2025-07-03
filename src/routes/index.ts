import { Router } from "express";
import chapterRouter from "./chapter.routes";
import bookRouter from "./book.routes";
import userRouter from "./user.routes";
import genreRouter from "./genre.routes";
import authorRouter from "./author.routes";

const rootRoutes=Router()

rootRoutes.use('/chapters',chapterRouter)
rootRoutes.use('/books',bookRouter)
rootRoutes.use('/user',userRouter)
rootRoutes.use('/genre',genreRouter)
rootRoutes.use('/author',authorRouter)



export default rootRoutes




