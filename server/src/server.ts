import "./config/env.js"; 
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import appRouter from './routes/index.js';
import { testElasticConnection } from './config/elastic.js';
import { createTripsIndex } from './config/elastic-setup.js';
import { startElasticSyncWorker } from "./workers/elastic-sync.worker.js";
import { connectRedis } from "./config/redis.js";
dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());

app.use('/api', appRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await testElasticConnection();
    await createTripsIndex();
    await startElasticSyncWorker();
    await connectRedis();
});
