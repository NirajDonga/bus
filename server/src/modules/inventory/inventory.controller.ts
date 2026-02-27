import { Request, Response } from "express";
import { inventoryService } from "./inventory.service.js";

export class InventoryController {
    getTripInventory = async (req: Request, res: Response) => {
        try {
            const tripId = Number(req.params.tripId);
            if (isNaN(tripId)) {
                res.status(400).json({ success: false, message: "Invalid trip ID" });
                return;
            }

            const seats = await inventoryService.getInventory(tripId);
            if (!seats) {
                res.status(404).json({ success: false, message: "Trip not found" });
                return;
            }

            res.status(200).json({ success: true, data: { tripId, seats } });
        } catch (error) {
            res.status(500).json({ success: false, message: "Failed to fetch inventory" });
        }
    };
}

export const inventoryController = new InventoryController();
