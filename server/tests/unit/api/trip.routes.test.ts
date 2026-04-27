import "../../helpers/env.ts";
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import tripRoutes from "../../../src/modules/trips/trip.routes.js";
import { tripService } from "../../../src/modules/trips/trip.service.js";
import { bearerToken } from "../../helpers/auth.ts";
import { createTestApi, TestApi } from "../../helpers/api.ts";

const admin = { authorization: bearerToken({ id: 1, role: "admin" }) };
const user = { authorization: bearerToken({ id: 2, role: "user" }) };
const originalGetAllTrips = tripService.getAllTrips;
const originalGetTripById = tripService.getTripById;
const originalCreateTrip = tripService.createTrip;

describe("trip routes", () => {
    let api: TestApi;

    before(async () => {
        (tripService as any).getAllTrips = async () => [{ id: 1 }];
        (tripService as any).getTripById = async (id: number) => ({ id });
        (tripService as any).createTrip = async (data: any) => ({ id: 9, ...data });
        api = await createTestApi(tripRoutes, "/api/trips");
    });

    after(async () => {
        await api.close();
        tripService.getAllTrips = originalGetAllTrips;
        tripService.getTripById = originalGetTripById;
        tripService.createTrip = originalCreateTrip;
    });

    it("allows public trip listing", async () => {
        const response = await api.request("GET", "/");

        assert.equal(response.status, 200);
        assert.deepEqual(response.body, [{ id: 1 }]);
    });

    it("rejects non-admin trip creation", async () => {
        const response = await api.request("POST", "/", {
            headers: user,
            body: {},
        });

        assert.equal(response.status, 403);
    });

    it("validates admin trip creation payloads", async () => {
        const response = await api.request("POST", "/", {
            headers: admin,
            body: { busId: 1 },
        });

        assert.equal(response.status, 400);
        assert.ok(response.body.errors);
    });
});
