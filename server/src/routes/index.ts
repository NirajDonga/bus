import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import stationRoutes from "../modules/stations/station.routes.js";

const router = Router();

router.use("/api/auth", authRoutes);
router.use("api//stations", stationRoutes);

export default router;