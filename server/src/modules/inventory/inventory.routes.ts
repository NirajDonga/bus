import { Router } from "express";
import { inventoryController } from "./inventory.controller.js";

const router = Router();

router.get("/:tripId", inventoryController.getTripInventory);

export default router;
