import { Router } from "express";
import { inventoryController } from "./inventory.controller.js";

import { userOnly } from "../../middlewares/protect.js";

const router = Router();

router.get("/:tripId", inventoryController.getSeatMap);
router.post("/:tripId/lock-seats", userOnly, inventoryController.lockSeats);

export default router;
