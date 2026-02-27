import pool from "../../config/postgres.js";

export class InventoryRepository {
    async getTripLayout(tripId: number) {
        const result = await pool.query(
            `SELECT bl.layout, bl.total_seats
             FROM trips t
             JOIN buses b ON b.id = t.bus_id
             JOIN bus_layouts bl ON bl.id = b.layout_id
             WHERE t.id = $1`,
            [tripId]
        );
        return result.rows[0] ?? null;
    }

    async getBookedSeats(tripId: number): Promise<string[]> {
        const result = await pool.query(
            `SELECT seat_number FROM tickets
             WHERE trip_id = $1 AND status IN ('confirmed', 'pending')`,
            [tripId]
        );
        return result.rows.map(row => row.seat_number);
    }
}

export const inventoryRepo = new InventoryRepository();
