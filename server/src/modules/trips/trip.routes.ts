import { Router } from "express";
import { tripController } from "./trip.controller.js";
import { adminOnly } from "../../middlewares/protect.js";

const router = Router();

// Only Admins can manage trips
router.post("/", adminOnly, tripController.createTrip);
router.patch("/:id", adminOnly, tripController.updateTrip);
router.delete("/:id", adminOnly, tripController.deleteTrip);

// Public routes
router.get("/", tripController.getAllTrips);
router.get("/:id", tripController.getTripById);

export default router;
