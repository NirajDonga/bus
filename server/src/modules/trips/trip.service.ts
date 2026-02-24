import { TripRepository } from "./trip.repo.js";
import { FleetRepository } from "../fleet/fleet.repo.js";
import { StationRepository } from "../stations/station.repo.js";
import type { CreateTripBody, UpdateTripBody } from "./trip.schema.js";

export class TripService {
    private tripRepo = new TripRepository();
    private fleetRepo = new FleetRepository();
    private stationRepo = new StationRepository();

    createTrip = async (data: CreateTripBody) => {
        // Validation: Verify Bus exists and grab available seats
        const bus = await this.fleetRepo.findBusById(data.busId);
        if (!bus) throw new Error(`Bus with ID ${data.busId} not found`);

        // Validation: Prevent physical double-booking of a bus
        const conflicts = await this.tripRepo.findConflictingTrips(
            data.busId,
            data.departureTime,
            data.arrivalTime
        );
        if (conflicts.length > 0) {
            throw new Error(`Bus ${bus.plate_number} is already scheduled for another trip during this time block.`);
        }

        // Auto-assign available_seats to the exact total capacity of the bus's layout
        const fullData = {
            ...data,
            availableSeats: bus.total_seats
        };

        return await this.tripRepo.createTrip(fullData);
    }

    getAllTrips = async () => {
        return await this.tripRepo.getAllTrips();
    }

    getTripById = async (id: number) => {
        const trip = await this.tripRepo.getTripById(id);
        if (!trip) throw new Error(`Trip with ID ${id} not found`);
        return trip;
    }

    updateTrip = async (id: number, data: UpdateTripBody) => {
        const trip = await this.tripRepo.getTripById(id);
        if (!trip) throw new Error(`Trip with ID ${id} not found`);

        // If time changes and status is not cancelled, re-check double booking
        if (data.departureTime || data.arrivalTime) {
            const nextDep = data.departureTime || trip.departure_time;
            const nextArr = data.arrivalTime || trip.arrival_time;
            const status = data.status || trip.status;

            if (status !== 'cancelled') {
                const conflicts = await this.tripRepo.findConflictingTrips(trip.bus_id, nextDep, nextArr);
                const genuineConflicts = conflicts.filter(c => c.id !== id);
                if (genuineConflicts.length > 0) {
                    throw new Error(`Time update conflicts with another scheduled trip for this bus.`);
                }
            }
        }

        return await this.tripRepo.updateTrip(id, data);
    }

    deleteTrip = async (id: number) => {
        const trip = await this.tripRepo.getTripById(id);
        if (!trip) throw new Error(`Trip with ID ${id} not found`);
        return await this.tripRepo.deleteTrip(id);
    }
}

export const tripService = new TripService();
