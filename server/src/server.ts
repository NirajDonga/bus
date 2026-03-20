import "./config/env.js";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import appRouter from './routes/index.js';
import { startAbandonedBookingWorker } from "./workers/abandoned-booking.worker.js";
import { connectRedis } from "./config/redis.js";
dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());

app.use('/api', appRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await connectRedis();
    startAbandonedBookingWorker();
});
