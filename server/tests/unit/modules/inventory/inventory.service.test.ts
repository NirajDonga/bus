import "../../../helpers/env.ts";
import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { inventoryService } from "../../../../src/modules/inventory/inventory.service.js";
import { inventoryRepo } from "../../../../src/modules/inventory/inventory.repo.js";
import { redisClient } from "../../../../src/config/redis.js";

const tripData = {
    schedule: [
        { stop_id: 1 },
        { stop_id: 2 },
        { stop_id: 3 },
    ],
    layout: [["1A", "1B"], ["2A", null]],
};

describe("inventoryService", () => {
    beforeEach(() => {
        (inventoryRepo as any).getTripData = async () => tripData;
        (inventoryRepo as any).getBookedSeatsForSegment = async () => ["1B"];
        (redisClient as any).get = async (key: string) => {
            if (key.endsWith(":1A")) return JSON.stringify({ userId: 8, boardSeq: 0, dropSeq: 2 });
            return null;
        };
    });

    it("returns null for unknown trips", async () => {
        (inventoryRepo as any).getTripData = async () => null;

        const seatMap = await inventoryService.getSeatMap(99, 1, 2);

        assert.equal(seatMap, null);
    });

    it("returns null for invalid station order", async () => {
        const seatMap = await inventoryService.getSeatMap(10, 3, 1);

        assert.equal(seatMap, null);
    });

    it("marks seats as booked, locked, or available for the requested segment", async () => {
        const seatMap = await inventoryService.getSeatMap(10, 1, 2);

        assert.deepEqual(seatMap?.seats, {
            "1A": "locked",
            "1B": "booked",
            "2A": "available",
        });
    });

    it("releases locks through a redis pipeline", async () => {
        const deleted: string[] = [];
        (redisClient as any).multi = () => ({
            del: (key: string) => deleted.push(key),
            exec: async () => "ok",
        });

        await inventoryService.releaseSeatLocks(10, ["1A", "2A"]);

        assert.deepEqual(deleted, ["lock:trip:10:seat:1A", "lock:trip:10:seat:2A"]);
    });
});
