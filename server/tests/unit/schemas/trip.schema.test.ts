import "../../helpers/env.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CreateTripSchema, UpdateTripSchema } from "../../../src/modules/trips/trip.schema.js";

const schedule = [
    { stop_id: 1, arrival: "08:00", departure: "08:10", price: 0 },
    { stop_id: 2, arrival: "10:00", departure: "10:10", price: 500 },
];

describe("trip schemas", () => {
    it("accepts a valid trip payload", () => {
        const parsed = CreateTripSchema.safeParse({
            busId: 10,
            firstStop: 1,
            lastStop: 2,
            departureTime: "2026-05-01T08:00:00.000+05:30",
            arrivalTime: "2026-05-01T10:00:00.000+05:30",
            schedule,
        });

        assert.equal(parsed.success, true);
    });

    it("rejects trips with fewer than two stops", () => {
        const parsed = CreateTripSchema.safeParse({
            busId: 10,
            firstStop: 1,
            lastStop: 2,
            departureTime: "2026-05-01T08:00:00.000+05:30",
            arrivalTime: "2026-05-01T10:00:00.000+05:30",
            schedule: [schedule[0]],
        });

        assert.equal(parsed.success, false);
    });

    it("rejects unsupported update statuses", () => {
        const parsed = UpdateTripSchema.safeParse({ status: "paid" });

        assert.equal(parsed.success, false);
    });
});
