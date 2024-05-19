import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import {errorHandler} from "./middlewares/error.middleware.js"
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(errorHandler)

//routes import
import userRouter from './routes/user.routes.js';
import chapterRouter from './routes/chapter.route.js';
import eventRouter from './routes/event.route.js';

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
  });
  
//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/chapters", chapterRouter);
app.use("/api/v1/events", eventRouter);

// http://localhost:8000/api/v1/users/register

export { app }