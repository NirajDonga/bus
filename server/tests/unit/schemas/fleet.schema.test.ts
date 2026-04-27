import "../../helpers/env.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BusBodySchema, LayoutBodySchema, UpdateBusSchema } from "../../../src/modules/fleet/fleet.schema.js";

const seat = {
    id: "1A",
    deck: "lower",
    type: "seater",
    row: 1,
    col: 1,
};

describe("fleet schemas", () => {
    it("accepts a layout when totalSeats matches the seat list", () => {
        const parsed = LayoutBodySchema.safeParse({
            name: "2x1 seater",
            totalSeats: 1,
            layout: { seats: [seat] },
        });

        assert.equal(parsed.success, true);
    });

    it("rejects layouts with a mismatched seat count", () => {
        const parsed = LayoutBodySchema.safeParse({
            name: "Broken layout",
            totalSeats: 2,
            layout: { seats: [seat] },
        });

        assert.equal(parsed.success, false);
        if (!parsed.success) {
            assert.ok(parsed.error.flatten().fieldErrors.totalSeats);
        }
    });

    it("requires a positive layout id for buses", () => {
        const parsed = BusBodySchema.safeParse({
            plateNumber: "KA01AA1234",
            operatorName: "Swift Travels",
            layoutId: 0,
        });

        assert.equal(parsed.success, false);
    });

    it("requires at least one field when updating a bus", () => {
        const parsed = UpdateBusSchema.safeParse({});

        assert.equal(parsed.success, false);
    });
});
