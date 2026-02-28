import pool from "../../config/postgres.js";
import { inventoryService } from "../inventory/inventory.service.js";
import { bookingRepo } from "./booking.repo.js";
import { CreateBookingBody } from "./booking.schema.js";

export class BookingService {

    async reserveSeats(userId: number, body: CreateBookingBody) {
        const { tripId, boardingStationId, droppingStationId, seatNumbers, passengers } = body;

        const tripResult = await pool.query(`SELECT schedule FROM trips WHERE id = $1`, [tripId]);
        if (tripResult.rows.length === 0) throw new Error("Trip not found");

        const schedule: any[] = tripResult.rows[0].schedule;
        const boardingStop = schedule.find(s => s.stop_id === boardingStationId);
        const droppingStop = schedule.find(s => s.stop_id === droppingStationId);

        if (!boardingStop || !droppingStop) throw new Error("Invalid boarding or dropping station");

        const boardSeq = schedule.indexOf(boardingStop);
        const dropSeq = schedule.indexOf(droppingStop);

        if (boardSeq >= dropSeq) throw new Error("Boarding stop must come before dropping stop");

        const pricePerSeat = droppingStop.price - boardingStop.price;

        for (const seat of seatNumbers) {
            const key = `lock:trip:${tripId}:seat:${seat}`;
            const existing = await inventoryService.getSeatLock(key);

            if (!existing || existing.userId !== userId) {
                throw new Error(`Your 10-minute checkout window has expired or the seat ${seat} is no longer reserved for you. Please start over.`);
            }
        }

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const booking = await bookingRepo.createPendingBooking({
            userId,
            tripId,
            totalAmount: pricePerSeat * seatNumbers.length,
            expiresAt,
            tickets: passengers.map(p => ({
                seatNumber: p.seatNumber,
                passengerName: p.name,
                passengerAge: p.age,
                passengerGender: p.gender,
                boardSeq,
                dropSeq,
                pricePaid: pricePerSeat,
            }))
        });

        return { bookingId: booking.id, totalAmount: pricePerSeat * seatNumbers.length };
    }
}

export const bookingService = new BookingService();
