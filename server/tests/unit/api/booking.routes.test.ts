import "../../helpers/env.ts";
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import bookingRoutes from "../../../src/modules/bookings/booking.routes.js";
import { bookingService } from "../../../src/modules/bookings/booking.service.js";
import { bearerToken } from "../../helpers/auth.ts";
import { createTestApi, TestApi } from "../../helpers/api.ts";

const originalReserveSeats = bookingService.reserveSeats;

const validBody = {
    tripId: 10,
    boardingStationId: 1,
    droppingStationId: 2,
    seatNumbers: ["1A"],
    passengers: [{ seatNumber: "1A", name: "Asha Rao", age: 28, gender: "female" }],
};

describe("booking routes", () => {
    let api: TestApi;

    before(async () => {
        (bookingService as any).reserveSeats = async () => ({ bookingId: 88, totalAmount: 500 });
        api = await createTestApi(bookingRoutes, "/api/bookings");
    });

    after(async () => {
        await api.close();
        bookingService.reserveSeats = originalReserveSeats;
    });

    it("requires authentication for reservations", async () => {
        const response = await api.request("POST", "/reserve", { body: validBody });

        assert.equal(response.status, 401);
    });

    it("creates a reservation for authenticated users", async () => {
        const response = await api.request("POST", "/reserve", {
            headers: { authorization: bearerToken({ id: 5, role: "user" }) },
            body: validBody,
        });

        assert.equal(response.status, 201);
        assert.equal(response.body.success, true);
        assert.deepEqual(response.body.data, { bookingId: 88, totalAmount: 500 });
    });
});
