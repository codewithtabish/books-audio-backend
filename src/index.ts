import dotenv from 'dotenv'
dotenv.config()
import cors from "cors";

import express, { Application, Request, Response } from 'express';
import rootRoutes from './routes';
import { errorHandler } from './middleware/error-handler';
import { redis } from './lib/redis';
import { RedisKeys } from './config/redis-key';


const app:Application = express();

const PORT = 46000;


app.use(express.json());
app.use(cors())



// now here define all root routes

app.use('/api/v1',rootRoutes)

app.get('/', (_req:Request, res:Response) => {
  console.log('IN HOME ROUTE')
  res.send(`your request is handled by worker having ${process.pid}`)

  // res.send('Hello from TypeScript backend!!! --- ---');
});

app.get('/test', (req, res) => {
  // console.log('IN /api/v1/test');
  res.json({ message: 'Test route' });
});



// Global error handler (must be last)
app.use(errorHandler);


export const startServer=()=>{
  app.listen(PORT, async() => {
    // const cachedGenres = await redis.get(RedisKeys.ALL_GENRES);
    // const single = await redis.get(RedisKeys.GENRE_DETAIL("cmcn8pa840002ujosthay0y4y"));
        // const cachedAuthors = await redis.get(RedisKeys.ALL_AUTHORS);
        // const cachedAuthors = await redis.get(RedisKeys.ALL_AUTHORS);

      // console.log("cachedGenres in index cachedGenras",cachedGenres)
      // console.log("cachedGenres in index single 🔥🔥",single)
      // console.log("cachedGenres in all authors 🔥🔥",cachedAuthors)
      console.log(`woker ${process.pid} is running on port ${PORT} ---`)
  // console.log(`Server is running at http://localhost:${PORT} 🔥🔥 ---`);
});
}



startServer()
// ORM - OBJECT RELATIONAL MAPPING 

// slect * from users where 


// taskkill /f /im node.exe

// banner 

// cover 
// https://d1d7s2thm5nyyd.cloudfront.net/book-1-cover-think-and-grow.webp



// https://generated.photos

// https://squoosh.app/editor


// tabish@@##9988AAA