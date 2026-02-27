import { redisClient } from "../../config/redis.js";
import { inventoryRepo } from "./inventory.repo.js";

export class InventoryService {
    private key = (tripId: number) => `inventory:${tripId}`;

    async getInventory(tripId: number) {
        const key = this.key(tripId);
        let seats = await redisClient.hGetAll(key);

        if (Object.keys(seats).length === 0) {
            const layout = await inventoryRepo.getTripLayout(tripId);
            if (!layout) return null;

            const bookedSeats = await inventoryRepo.getBookedSeats(tripId);
            const allSeats: string[] = layout.layout.flat().filter(Boolean);

            const fields: Record<string, string> = {};
            for (const seat of allSeats) {
                fields[seat] = bookedSeats.includes(seat) ? "booked" : "available";
            }

            await redisClient.hSet(key, fields);
            seats = fields;
        }

        return seats;
    }

    async seedInventory(tripId: number, seatNumbers: string[]) {
        const fields: Record<string, string> = {};
        for (const seat of seatNumbers) {
            fields[seat] = "available";
        }
        await redisClient.hSet(this.key(tripId), fields);
    }

    async updateSeats(tripId: number, seatNumbers: string[], status: "available" | "locked" | "booked") {
        const fields: Record<string, string> = {};
        for (const seat of seatNumbers) {
            fields[seat] = status;
        }
        await redisClient.hSet(this.key(tripId), fields);
    }
}

export const inventoryService = new InventoryService();
