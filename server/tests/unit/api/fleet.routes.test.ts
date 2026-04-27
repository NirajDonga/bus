import "../../helpers/env.ts";
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import fleetRoutes from "../../../src/modules/fleet/fleet.routes.js";
import { fleetService } from "../../../src/modules/fleet/fleet.service.js";
import { bearerToken } from "../../helpers/auth.ts";
import { createTestApi, TestApi } from "../../helpers/api.ts";

const admin = { authorization: bearerToken({ id: 1, role: "admin" }) };
const originalGetBuses = fleetService.getBuses;
const originalCreateBus = fleetService.createBus;

describe("fleet routes", () => {
    let api: TestApi;

    before(async () => {
        (fleetService as any).getBuses = async () => [{ id: 1, plate_number: "KA01AA1234" }];
        (fleetService as any).createBus = async () => ({ id: 2, plate_number: "KA02BB5678" });
        api = await createTestApi(fleetRoutes, "/api/fleet");
    });

    after(async () => {
        await api.close();
        fleetService.getBuses = originalGetBuses;
        fleetService.createBus = originalCreateBus;
    });

    it("requires admin access for fleet routes", async () => {
        const response = await api.request("GET", "/buses");

        assert.equal(response.status, 401);
    });

    it("allows admins to list buses", async () => {
        const response = await api.request("GET", "/buses", { headers: admin });

        assert.equal(response.status, 200);
        assert.deepEqual(response.body, [{ id: 1, plate_number: "KA01AA1234" }]);
    });

    it("validates bus creation body", async () => {
        const response = await api.request("POST", "/buses", {
            headers: admin,
            body: { plateNumber: "" },
        });

        assert.equal(response.status, 400);
        assert.ok(response.body.errors);
    });
});
