import { Request, Response } from "express";
import { inventoryService } from "./inventory.service.js";
import { inventoryRepo } from "./inventory.repo.js";

export class InventoryController {

    getSeatMap = async (req: Request, res: Response) => {
        try {
            const tripId = Number(req.params.tripId);
            const boardingStationId = Number(req.query.from);
            const droppingStationId = Number(req.query.to);

            if (!tripId || !boardingStationId || !droppingStationId) {
                res.status(400).json({ success: false, message: "tripId, from, and to are required" });
                return;
            }

            const data = await inventoryService.getSeatMap(tripId, boardingStationId, droppingStationId);
            if (!data) {
                res.status(404).json({ success: false, message: "Trip not found or invalid stations" });
                return;
            }

            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: "Failed to fetch seat map" });
        }
    };

    lockSeats = async (req: Request, res: Response) => {
        try {
            const { tripId } = req.params;
            const { seatNumbers, boardingStationId, droppingStationId } = req.body;
            const userId = (req as any).user.id;

            if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
                return res.status(400).json({ success: false, message: "seatNumbers array is required" });
            }
            if (seatNumbers.length > 6) {
                return res.status(400).json({ success: false, message: "You can only book a maximum of 6 seats at once" });
            }

            const tripData = await inventoryRepo.getTripData(Number(tripId));
            if (!tripData) return res.status(404).json({ success: false, message: "Trip not found" });

            const schedule: any[] = tripData.schedule;
            const boardSeq = schedule.findIndex((s: any) => s.stop_id === boardingStationId);
            const dropSeq = schedule.findIndex((s: any) => s.stop_id === droppingStationId);

            if (boardSeq === -1 || dropSeq === -1 || boardSeq >= dropSeq) {
                return res.status(400).json({ success: false, message: "Invalid boarding or dropping station" });
            }

            // Attempt to lock all requested seats
            for (const seat of seatNumbers) {
                const key = `lock:trip:${tripId}:seat:${seat}`;
                const existing = await inventoryService.getSeatLock(key);

                if (existing) {
                    if (existing.boardSeq < dropSeq && existing.dropSeq > boardSeq) {
                        return res.status(409).json({ success: false, message: `Seat ${seat} was just grabbed by someone else.` });
                    }
                }
            }

            // Since all passed safety checks, lock them!
            for (const seat of seatNumbers) {
                const key = `lock:trip:${tripId}:seat:${seat}`;
                await inventoryService.setSeatLock(key, 600, { userId, boardSeq, dropSeq }); // Lock for 10 minutes checking out
            }

            res.status(200).json({ success: true, message: "Seats successfully locked for 10 minutes checkout window" });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
}

export const inventoryController = new InventoryController();
