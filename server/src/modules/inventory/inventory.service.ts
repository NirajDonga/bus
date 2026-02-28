import { redisClient } from "../../config/redis.js";
import { inventoryRepo } from "./inventory.repo.js";

const lockKey = (tripId: number, seat: string) => `lock:trip:${tripId}:seat:${seat}`;

const SELECTION_TTL = 300;  // 5 min — while user is selecting seats
const CHECKOUT_TTL = 600;   // 10 min — while user is on payment page

export class InventoryService {

    async getSeatMap(tripId: number, boardingStationId: number, droppingStationId: number) {
        const tripData = await inventoryRepo.getTripData(tripId);
        if (!tripData) return null;

        const schedule: any[] = tripData.schedule;
        const boardSeq = schedule.findIndex(s => s.stop_id === boardingStationId);
        const dropSeq = schedule.findIndex(s => s.stop_id === droppingStationId);

        if (boardSeq === -1 || dropSeq === -1 || boardSeq >= dropSeq) return null;

        const bookedSeats = await inventoryRepo.getBookedSeatsForSegment(tripId, boardSeq, dropSeq);
        const allSeats: string[] = tripData.layout.flat().filter(Boolean);

        const seats: Record<string, "available" | "locked" | "booked"> = {};

        for (const seat of allSeats) {
            if (bookedSeats.includes(seat)) {
                seats[seat] = "booked";
                continue;
            }

            const lockData = await redisClient.get(lockKey(tripId, seat));
            if (lockData) {
                const lock = JSON.parse(lockData);
                if (lock.boardSeq < dropSeq && lock.dropSeq > boardSeq) {
                    seats[seat] = "locked";
                    continue;
                }
            }

            seats[seat] = "available";
        }

        return { layout: tripData.layout, seats };
    }

    async getSeatLock(key: string) {
        const lockData = await redisClient.get(key);
        return lockData ? JSON.parse(lockData) : null;
    }

    async setSeatLock(key: string, ttl: number, data: { userId: number, boardSeq: number, dropSeq: number }) {
        await redisClient.setEx(key, ttl, JSON.stringify(data));
    }
}

export const inventoryService = new InventoryService();
