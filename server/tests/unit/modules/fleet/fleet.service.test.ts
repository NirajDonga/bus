import "../../../helpers/env.ts";
import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { fleetService } from "../../../../src/modules/fleet/fleet.service.js";

const repo = {
    findLayoutById: async (_id: number): Promise<any> => ({ id: _id, name: "Layout" }),
    findBusByPlate: async (_plate: string): Promise<any> => undefined,
    findBusById: async (_id: number): Promise<any> => ({ id: _id, plate_number: "KA01AA1234" }),
    createBus: async (plateNumber: string, operatorName: string, layoutId: number) => ({ id: 1, plateNumber, operatorName, layoutId }),
    updateBus: async (id: number, fields: object) => ({ id, ...fields }),
    deleteBus: async (id: number) => ({ id }),
};

describe("fleetService", () => {
    beforeEach(() => {
        (fleetService as any).fleetRepo = { ...repo };
    });

    it("rejects duplicate bus plates", async () => {
        (fleetService as any).fleetRepo.findBusByPlate = async () => ({ id: 5 });

        await assert.rejects(
            fleetService.createBus("KA01AA1234", "Swift Travels", 1),
            /already exists/
        );
    });

    it("requires an existing layout before creating a bus", async () => {
        (fleetService as any).fleetRepo.findLayoutById = async () => undefined;

        await assert.rejects(
            fleetService.createBus("KA01AA1234", "Swift Travels", 999),
            /Layout with ID 999 not found/
        );
    });

    it("creates a bus after plate and layout validation", async () => {
        const bus = await fleetService.createBus("KA01AA1234", "Swift Travels", 1);

        assert.deepEqual(bus, {
            id: 1,
            plateNumber: "KA01AA1234",
            operatorName: "Swift Travels",
            layoutId: 1,
        });
    });

    it("rejects bus plate conflicts on update", async () => {
        (fleetService as any).fleetRepo.findBusByPlate = async () => ({ id: 88 });

        await assert.rejects(
            fleetService.updateBus(7, { plateNumber: "KA02BB5678" }),
            /already used/
        );
    });
});
