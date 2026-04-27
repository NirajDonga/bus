import "../../helpers/env.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CreateBookingSchema } from "../../../src/modules/bookings/booking.schema.js";

describe("booking schema", () => {
    it("coerces tripId and accepts matching passenger seat data", () => {
        const parsed = CreateBookingSchema.safeParse({
            tripId: "20",
            boardingStationId: 1,
            droppingStationId: 2,
            seatNumbers: ["1A"],
            passengers: [{ seatNumber: "1A", name: "Asha Rao", age: 28, gender: "female" }],
        });

        assert.equal(parsed.success, true);
        if (parsed.success) {
            assert.equal(parsed.data.tripId, 20);
        }
    });

    it("rejects empty seat selections", () => {
        const parsed = CreateBookingSchema.safeParse({
            tripId: 20,
            boardingStationId: 1,
            droppingStationId: 2,
            seatNumbers: [],
            passengers: [],
        });

        assert.equal(parsed.success, false);
    });
});
