import pool from "../../config/postgres.js";

export class SearchRepository {

    findTripsByRouteAndDate = async (fromCity: string, toCity: string, date: string, page: number, limit: number) => {
        const offset = (page - 1) * limit;

        const { rows: tripIds } = await pool.query(`
            SELECT DISTINCT t.id
            FROM trips t
            JOIN buses b ON t.bus_id = b.id
            CROSS JOIN LATERAL jsonb_array_elements(t.schedule) WITH ORDINALITY AS from_stop(data, seq)
            CROSS JOIN LATERAL jsonb_array_elements(t.schedule) WITH ORDINALITY AS to_stop(data, seq)
            JOIN stations s_from ON (from_stop.data->>'stop_id')::int = s_from.id
            JOIN stations s_to   ON (to_stop.data->>'stop_id')::int = s_to.id
            WHERE t.departure_time >= ($1 || 'T00:00:00')::timestamptz
              AND t.departure_time <= ($1 || 'T23:59:59.999')::timestamptz
              AND LOWER(s_from.city) = LOWER($2)
              AND LOWER(s_to.city) = LOWER($3)
              AND from_stop.seq < to_stop.seq
              AND t.status != 'cancelled'
            ORDER BY t.id
            LIMIT $4 OFFSET $5
        `, [date, fromCity, toCity, limit, offset]);

        if (tripIds.length === 0) return [];

        const results = [];
        for (const { id } of tripIds) {
            const doc = await this.buildTripDocument(id);
            if (doc) results.push(doc);
        }
        return results;
    }

    buildTripDocument = async (tripId: number) => {
        const { rows } = await pool.query(`
            SELECT t.*, b.plate_number, b.operator_name, bl.total_seats
            FROM trips t
            JOIN buses b ON t.bus_id = b.id
            JOIN bus_layouts bl ON b.layout_id = bl.id
            WHERE t.id = $1
        `, [tripId]);

        if (rows.length === 0) return null;
        const trip = rows[0];

        const stopIds = trip.schedule.map((s: any) => s.stop_id);
        const { rows: stations } = await pool.query(
            `SELECT id, name, city FROM stations WHERE id = ANY($1)`, [stopIds]
        );

        const enrichedSchedule = trip.schedule.map((stop: any, i: number) => {
            const station = stations.find((s: any) => s.id === stop.stop_id) || { name: "Unknown", city: "Unknown" };
            const { price, ...rest } = stop;
            return { ...rest, station_name: station.name, station_city: station.city, sequence: i + 1 };
        });

        const { rows: tickets } = await pool.query(`
            SELECT board_seq, drop_seq FROM tickets 
            WHERE trip_id = $1 AND status IN ('confirmed', 'pending')
        `, [tripId]);

        const legAvailability = new Array(enrichedSchedule.length - 1).fill(trip.total_seats);
        for (const t of tickets)
            for (let i = t.board_seq - 1; i < t.drop_seq - 1; i++)
                if (i >= 0 && i < legAvailability.length) legAvailability[i]--;

        const routes: any[] = [];
        for (let i = 0; i < enrichedSchedule.length - 1; i++) {
            for (let j = i + 1; j < enrichedSchedule.length; j++) {
                let minSeats = trip.total_seats;
                for (let leg = i; leg < j; leg++)
                    if (legAvailability[leg] < minSeats) minSeats = legAvailability[leg];

                routes.push({
                    from_city: enrichedSchedule[i].station_city,
                    to_city: enrichedSchedule[j].station_city,
                    available_seats: minSeats,
                    price: trip.schedule[j].price - trip.schedule[i].price
                });
            }
        }

        return {
            id: trip.id,
            departure_time: trip.departure_time,
            arrival_time: trip.arrival_time,
            bus: { plate_number: trip.plate_number, operator_name: trip.operator_name },
            schedule: enrichedSchedule,
            routes
        };
    }
}
