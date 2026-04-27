import "../../helpers/env.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createMockResponse } from "../../helpers/http.ts";
import { StationController } from "../../../src/modules/stations/station.controller.js";

const createController = (service: Record<string, unknown>) => {
    const controller: any = new StationController();
    controller.stationService = service;
    return controller as StationController;
};

describe("StationController", () => {
    it("returns 400 for invalid station input", async () => {
        const controller = createController({});
        const res = createMockResponse();

        await controller.createStation({ body: { name: "A" } } as any, res as any);

        assert.equal(res.statusCode, 400);
        assert.ok((res.body as any).errors);
    });

    it("returns 409 for duplicate stations", async () => {
        const controller = createController({
            createStation: async () => {
                throw new Error("Station 'Majestic' in 'Bengaluru' already exists.");
            },
        });
        const res = createMockResponse();

        await controller.createStation({
            body: { name: "Majestic", city: "Bengaluru", state: "Karnataka" },
        } as any, res as any);

        assert.equal(res.statusCode, 409);
    });

    it("returns stations from the service", async () => {
        const stations = [{ id: 1, name: "Majestic" }];
        const controller = createController({ getAllStations: async () => stations });
        const res = createMockResponse();

        await controller.getAll({} as any, res as any);

        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, stations);
    });
});
