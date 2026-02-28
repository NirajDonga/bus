import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import stationRoutes from "../modules/stations/station.routes.js";
import fleetRoutes from "../modules/fleet/fleet.routes.js";
import tripRoutes from "../modules/trips/trip.routes.js";
import searchRoutes from "../modules/search/search.routes.js"
import inventoryRoutes from "../modules/inventory/inventory.routes.js";
import bookingRoutes from "../modules/bookings/booking.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/stations", stationRoutes);
router.use("/fleet", fleetRoutes);
router.use("/trips", tripRoutes);
router.use("/search", searchRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/bookings", bookingRoutes);

export default router;