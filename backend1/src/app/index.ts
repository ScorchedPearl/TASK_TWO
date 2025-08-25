import express from "express";
import bodyParser from "body-parser";
import DatabaseService from "./services/databaseservice";
import cors from "cors";
import RedisService from "./services/redisservice";
import authRouter from "./routes/auth";
import EmailService from "./services/emailservice";
import * as dotenv from "dotenv";
dotenv.config();

export const initServer: () => any = async () => {
 console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
  const dbService = DatabaseService.getInstance();
  await dbService.connect();
  const redisService = RedisService.getInstance();
  await redisService.connect();
  const emailService = EmailService.getInstance();
  await emailService.testConnection();
  const app=express();
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.use(cors({
    origin: FRONTEND_URL,
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(bodyParser.json())
  app.use('/api/auth', authRouter);
  return app;
}