import "../../../helpers/env.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { StationService } from "../../../../src/modules/stations/station.service.js";

const createService = (repo: Record<string, unknown>) => {
    const service: any = new StationService();
    service.stationRepo = repo;
    return service as StationService;
};

describe("StationService", () => {
    it("prevents duplicate station names in the same city", async () => {
        const service = createService({
            findByNameAndCity: async () => ({ id: 1 }),
            createStation: async () => assert.fail("duplicate stations should not be created"),
        });

        await assert.rejects(
            service.createStation("Majestic", "Bengaluru", "Karnataka"),
            /already exists/
        );
    });

    it("creates stations when there is no duplicate", async () => {
        const service = createService({
            findByNameAndCity: async () => undefined,
            createStation: async (name: string, city: string, state: string) => ({ id: 10, name, city, state }),
        });

        const station = await service.createStation("Majestic", "Bengaluru", "Karnataka");

        assert.deepEqual(station, {
            id: 10,
            name: "Majestic",
            city: "Bengaluru",
            state: "Karnataka",
        });
    });
});
