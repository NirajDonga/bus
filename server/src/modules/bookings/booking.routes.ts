import { Router } from "express";
import { bookingController } from "./booking.controller.js";
import { userOnly } from "../../middlewares/protect.js";

const router = Router();

// Endpoint for creating a reservation / pending booking
router.post("/reserve", userOnly, bookingController.reserveSeats);

export default router;
