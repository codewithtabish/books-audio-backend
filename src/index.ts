import dotenv from 'dotenv'
dotenv.config()
import cors from "cors";

import express, { Application, Request, Response } from 'express';
import rootRoutes from './routes';
import { errorHandler } from './middleware/error-handler';


const app:Application = express();

const PORT = 14000;


app.use(express.json());
app.use(cors())



// now here define all root routes

app.use('/api/v1',rootRoutes)

app.get('/', (_req:Request, res:Response) => {
  console.log('IN HOME ROUTE')

  res.send('Hello from TypeScript backend!!! --- ---');
});

app.get('/test', (req, res) => {
  console.log('IN /api/v1/test');
  res.json({ message: 'Test route' });
});



// Global error handler (must be last)
app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT} 🔥🔥 ---`);
});


// ORM - OBJECT RELATIONAL MAPPING 

// slect * from users where 


// taskkill /f /im node.exe

// banner 

// cover 
// https://d1d7s2thm5nyyd.cloudfront.net/book-1-cover-think-and-grow.webp



// https://generated.photos

// https://squoosh.app/editor