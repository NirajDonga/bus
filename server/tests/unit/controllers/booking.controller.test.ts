import "../../helpers/env.ts";
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { createMockResponse } from "../../helpers/http.ts";
import { bookingController } from "../../../src/modules/bookings/booking.controller.js";
import { bookingService } from "../../../src/modules/bookings/booking.service.js";

const originalReserveSeats = bookingService.reserveSeats;
const originalConsoleError = console.error;

const validBody = {
    tripId: 10,
    boardingStationId: 1,
    droppingStationId: 2,
    seatNumbers: ["1A"],
    passengers: [{ seatNumber: "1A", name: "Asha Rao", age: 28, gender: "female" }],
};

describe("bookingController", () => {
    beforeEach(() => {
        (bookingService as any).reserveSeats = async () => ({ bookingId: 99, totalAmount: 500 });
        console.error = () => undefined;
    });

    afterEach(() => {
        bookingService.reserveSeats = originalReserveSeats;
        console.error = originalConsoleError;
    });

    it("requires an authenticated request user", async () => {
        const res = createMockResponse();

        await bookingController.reserveSeats({ body: validBody } as any, res as any);

        assert.equal(res.statusCode, 500);
        assert.equal((res.body as any).success, false);
    });

    it("returns 400 for invalid reservation payloads", async () => {
        const res = createMockResponse();

        await bookingController.reserveSeats({
            user: { id: 5 },
            body: { ...validBody, seatNumbers: [] },
        } as any, res as any);

        assert.equal(res.statusCode, 400);
        assert.equal((res.body as any).success, false);
    });

    it("returns 201 with reservation details on success", async () => {
        const res = createMockResponse();

        await bookingController.reserveSeats({
            user: { id: 5 },
            body: validBody,
        } as any, res as any);

        assert.equal(res.statusCode, 201);
        assert.equal((res.body as any).success, true);
        assert.deepEqual((res.body as any).data, { bookingId: 99, totalAmount: 500 });
    });
});
