import pool from "../../config/db.js";
import { CreateTripBody, UpdateTripBody } from "./trip.schema.js";

export class TripRepository {

    createTrip = async (data: CreateTripBody & { availableSeats: number }) => {
        const query = `
            INSERT INTO trips (
                bus_id, first_stop, last_stop, departure_time, 
                arrival_time, schedule, available_seats
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [
            data.busId,
            data.firstStop,
            data.lastStop,
            data.departureTime,
            data.arrivalTime,
            JSON.stringify(data.schedule),
            data.availableSeats
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    getAllTrips = async () => {
        const query = `
            SELECT 
                t.*, 
                b.plate_number, 
                b.operator_name,
                s1.city AS first_stop_city,
                s2.city AS last_stop_city
            FROM trips t
            JOIN buses b ON t.bus_id = b.id
            JOIN stations s1 ON t.first_stop = s1.id
            JOIN stations s2 ON t.last_stop = s2.id
            ORDER BY t.departure_time DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    getTripById = async (id: number) => {
        const query = `
            SELECT 
                t.*, 
                b.plate_number, 
                b.operator_name,
                s1.city AS first_stop_city,
                s2.city AS last_stop_city
            FROM trips t
            JOIN buses b ON t.bus_id = b.id
            JOIN stations s1 ON t.first_stop = s1.id
            JOIN stations s2 ON t.last_stop = s2.id
            WHERE t.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    updateTrip = async (id: number, data: UpdateTripBody) => {
        const updates: string[] = [];
        const values: any[] = [];
        let i = 1;

        if (data.status) {
            updates.push(`status = $${i++}`);
            values.push(data.status);
        }
        if (data.departureTime) {
            updates.push(`departure_time = $${i++}`);
            values.push(data.departureTime);
        }
        if (data.arrivalTime) {
            updates.push(`arrival_time = $${i++}`);
            values.push(data.arrivalTime);
        }
        if (data.schedule) {
            updates.push(`schedule = $${i++}`);
            values.push(JSON.stringify(data.schedule));
        }

        // Always update the updated_at timestamp
        updates.push(`updated_at = NOW()`);

        values.push(id);
        const query = `
            UPDATE trips SET ${updates.join(", ")}
            WHERE id = $${i}
            RETURNING *
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    deleteTrip = async (id: number) => {
        const query = `DELETE FROM trips WHERE id = $1 RETURNING id`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    findConflictingTrips = async (busId: number, departureTime: string, arrivalTime: string) => {
        const query = `
            SELECT id FROM trips 
            WHERE bus_id = $1 
            AND status != 'cancelled'
            AND (
                (departure_time <= $2 AND arrival_time > $2) OR
                (departure_time < $3 AND arrival_time >= $3) OR
                (departure_time >= $2 AND arrival_time <= $3)
            )
        `;
        const result = await pool.query(query, [busId, departureTime, arrivalTime]);
        return result.rows;
    }
}
