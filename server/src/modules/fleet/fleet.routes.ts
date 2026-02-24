import { Router } from "express";
import { fleetController } from "./fleet.controller.js";
import { adminOnly } from "../../middlewares/protect.js";

const router = Router();

// Layout Routes (Protected: Admin Only)
router.get("/layouts", adminOnly, fleetController.getLayouts);
router.get("/layouts/:id", adminOnly, fleetController.getLayoutById);
router.post("/layouts", adminOnly, fleetController.createLayout);
router.patch("/layouts/:id", adminOnly, fleetController.updateLayout);
router.delete("/layouts/:id", adminOnly, fleetController.deleteLayout);

// Bus Routes (Protected: Admin Only)
router.get("/buses", adminOnly, fleetController.getBuses);
router.get("/buses/:id", adminOnly, fleetController.getBusById);
router.post("/buses", adminOnly, fleetController.createBus);
router.patch("/buses/:id", adminOnly, fleetController.updateBus);
router.delete("/buses/:id", adminOnly, fleetController.deleteBus);

export default router;