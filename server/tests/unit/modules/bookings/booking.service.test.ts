import "../../../helpers/env.ts";
import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import pool from "../../../../src/config/postgres.js";
import { inventoryService } from "../../../../src/modules/inventory/inventory.service.js";
import { bookingRepo } from "../../../../src/modules/bookings/booking.repo.js";
import { bookingService } from "../../../../src/modules/bookings/booking.service.js";

const body = {
    tripId: 10,
    boardingStationId: 1,
    droppingStationId: 3,
    seatNumbers: ["1A", "1B"],
    passengers: [
        { seatNumber: "1A", name: "Asha Rao", age: 28, gender: "female" as const },
        { seatNumber: "1B", name: "Ravi Rao", age: 32, gender: "male" as const },
    ],
};

describe("bookingService", () => {
    beforeEach(() => {
        (pool as any).query = async () => ({
            rows: [{
                schedule: [
                    { stop_id: 1, price: 0 },
                    { stop_id: 2, price: 300 },
                    { stop_id: 3, price: 700 },
                ],
            }],
        });
        (inventoryService as any).getSeatLock = async () => ({ userId: 5, boardSeq: 0, dropSeq: 2 });
        (bookingRepo as any).createPendingBooking = async (data: any) => ({ id: 77, ...data });
    });

    it("rejects missing trips", async () => {
        (pool as any).query = async () => ({ rows: [] });

        await assert.rejects(bookingService.reserveSeats(5, body), /Trip not found/);
    });

    it("requires boarding before dropping", async () => {
        await assert.rejects(
            bookingService.reserveSeats(5, {
                ...body,
                boardingStationId: 3,
                droppingStationId: 1,
            }),
            /Boarding stop must come before dropping stop/
        );
    });

    it("rejects seats when the checkout lock belongs to another user", async () => {
        (inventoryService as any).getSeatLock = async () => ({ userId: 99, boardSeq: 0, dropSeq: 2 });

        await assert.rejects(bookingService.reserveSeats(5, body), /checkout window has expired/);
    });

    it("creates a pending booking with calculated fare and ticket segments", async () => {
        let captured: any;
        (bookingRepo as any).createPendingBooking = async (data: any) => {
            captured = data;
            return { id: 77 };
        };

        const result = await bookingService.reserveSeats(5, body);

        assert.deepEqual(result, { bookingId: 77, totalAmount: 1400 });
        assert.equal(captured.userId, 5);
        assert.equal(captured.totalAmount, 1400);
        assert.equal(captured.tickets[0].boardSeq, 0);
        assert.equal(captured.tickets[0].dropSeq, 2);
        assert.equal(captured.tickets[0].pricePaid, 700);
        assert.ok(captured.expiresAt instanceof Date);
    });
});
