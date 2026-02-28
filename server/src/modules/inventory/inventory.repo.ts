import pool from "../../config/postgres.js";

export class InventoryRepository {

    async getTripData(tripId: number) {
        const result = await pool.query(
            `SELECT t.schedule, bl.layout
             FROM trips t
             JOIN buses b ON b.id = t.bus_id
             JOIN bus_layouts bl ON bl.id = b.layout_id
             WHERE t.id = $1`,
            [tripId]
        );
        return result.rows[0] ?? null;
    }

    async getBookedSeatsForSegment(tripId: number, boardSeq: number, dropSeq: number): Promise<string[]> {
        const result = await pool.query(
            `SELECT seat_number FROM tickets
             WHERE trip_id = $1
             AND status IN ('confirmed', 'pending')
             AND board_seq < $3
             AND drop_seq > $2`,
            [tripId, boardSeq, dropSeq]
        );
        return result.rows.map(row => row.seat_number);
    }
}

export const inventoryRepo = new InventoryRepository();
