import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import stationRoutes from "../modules/stations/station.routes.js";
import fleetRoutes from "../modules/fleet/fleet.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/stations", stationRoutes);
router.use("/fleet", fleetRoutes);

export default router;