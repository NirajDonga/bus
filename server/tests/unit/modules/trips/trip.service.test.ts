import "../../../helpers/env.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TripService } from "../../../../src/modules/trips/trip.service.js";

const validTrip = {
    busId: 10,
    firstStop: 1,
    lastStop: 3,
    departureTime: "2026-05-01T08:00:00.000+05:30",
    arrivalTime: "2026-05-01T12:00:00.000+05:30",
    schedule: [
        { stop_id: 1, arrival: "08:00", departure: "08:10", price: 0 },
        { stop_id: 2, arrival: "10:00", departure: "10:10", price: 300 },
        { stop_id: 3, arrival: "12:00", departure: "12:10", price: 700 },
    ],
};

const createService = () => {
    const service: any = new TripService();
    service.fleetRepo = {
        findBusById: async () => ({ id: 10, plate_number: "KA01AA1234", total_seats: 36 }),
    };
    service.tripRepo = {
        findConflictingTrips: async () => [],
        createTrip: async (data: any) => ({ id: 20, ...data }),
    };
    return service as TripService;
};

describe("TripService", () => {
    it("requires an existing bus before creating a trip", async () => {
        const service: any = createService();
        service.fleetRepo.findBusById = async () => undefined;

        await assert.rejects(service.createTrip(validTrip), /Bus with ID 10 not found/);
    });

    it("prevents scheduling a bus into a conflicting trip", async () => {
        const service: any = createService();
        service.tripRepo.findConflictingTrips = async () => [{ id: 99 }];

        await assert.rejects(service.createTrip(validTrip), /already scheduled/);
    });

    it("requires the first schedule price to be zero", async () => {
        const service = createService();

        await assert.rejects(
            service.createTrip({
                ...validTrip,
                schedule: [{ ...validTrip.schedule[0], price: 100 }, ...validTrip.schedule.slice(1)],
            }),
            /first stop/
        );
    });

    it("requires cumulative schedule prices", async () => {
        const service = createService();

        await assert.rejects(
            service.createTrip({
                ...validTrip,
                schedule: [
                    validTrip.schedule[0],
                    { ...validTrip.schedule[1], price: 500 },
                    { ...validTrip.schedule[2], price: 400 },
                ],
            }),
            /non-decreasing/
        );
    });

    it("sets available seats from the bus layout capacity", async () => {
        const service = createService();

        const created = await service.createTrip(validTrip);

        assert.equal(created.availableSeats, 36);
    });
});
