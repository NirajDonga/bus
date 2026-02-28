import { elasticClient } from "../config/elastic.js";
import pool from "../config/postgres.js";

export const syncTripToElastic = async (tripId: number) => {
    try {
        const query = `
            SELECT 
                t.*, 
                b.plate_number, 
                b.operator_name,
                bl.total_seats
            FROM trips t
            JOIN buses b ON t.bus_id = b.id
            JOIN bus_layouts bl ON b.layout_id = bl.id
            WHERE t.id = $1
        `;
        const result = await pool.query(query, [tripId]);

        if (result.rows.length === 0) {
            await elasticClient.delete({ index: "trips", id: String(tripId) }).catch(() => { });
            return;
        }

        const pgTrip = result.rows[0];
        const totalSeats = pgTrip.total_seats;

        const stopIds = pgTrip.schedule.map((s: any) => s.stop_id);
        const stationsQuery = `SELECT id, name, city FROM stations WHERE id = ANY($1)`;
        const { rows: stations } = await pool.query(stationsQuery, [stopIds]);

        const enrichedSchedule = pgTrip.schedule.map((stop: any, index: number) => {
            const station = stations.find(s => s.id === stop.stop_id) || { name: "Unknown", city: "Unknown" };
            const { price, ...restStop } = stop;

            return {
                ...restStop,
                station_name: station.name,
                station_city: station.city,
                sequence: index + 1
            };
        });

        // 1. Get all tickets for this trip
        const ticketsQuery = `
            SELECT board_seq, drop_seq 
            FROM tickets 
            WHERE trip_id = $1 AND status IN ('confirmed', 'pending')
        `;
        const { rows: tickets } = await pool.query(ticketsQuery, [tripId]);

        // 2. Compute available seats per physical leg
        const numberOfLegs = enrichedSchedule.length - 1;
        const legAvailability: number[] = new Array(numberOfLegs).fill(totalSeats);

        for (const ticket of tickets) {
            for (let i = ticket.board_seq - 1; i < ticket.drop_seq - 1; i++) {
                if (i >= 0 && i < legAvailability.length) {
                    legAvailability[i]--;
                }
            }
        }

        // 3. Generate all combinations, calculate seats and price
        const routes: any[] = [];
        for (let i = 0; i < enrichedSchedule.length - 1; i++) {
            for (let j = i + 1; j < enrichedSchedule.length; j++) {
                let minSeats = totalSeats;
                for (let leg = i; leg < j; leg++) {
                    if (legAvailability[leg] < minSeats) {
                        minSeats = legAvailability[leg];
                    }
                }

                // Price is difference in cumulative prices
                const basePrice = pgTrip.schedule[j].price - pgTrip.schedule[i].price;

                routes.push({
                    from_city: enrichedSchedule[i].station_city,
                    to_city: enrichedSchedule[j].station_city,
                    available_seats: minSeats,
                    price: basePrice
                });
            }
        }

        const elasticDocument = {
            id: pgTrip.id,
            departure_time: pgTrip.departure_time,
            arrival_time: pgTrip.arrival_time,
            bus: {
                plate_number: pgTrip.plate_number,
                operator_name: pgTrip.operator_name
            },
            schedule: enrichedSchedule,
            routes: routes
        };

        await elasticClient.index({
            index: "trips",
            id: String(pgTrip.id),
            document: elasticDocument,
            refresh: true
        });

    } catch (error) {
        console.error(`[Elastic Sync] Failed to sync Trip ${tripId}:`, error);
    }
}


export const startElasticSyncWorker = async () => {
    const client = await pool.connect();
    await client.query("LISTEN trip_updates");

    console.log("[Worker] Listening for Postgres trip updates...");

    client.on("notification", async (msg) => {
        if (msg.payload) {
            const tripId = parseInt(msg.payload, 10);
            console.log(`[Worker] Received Postgres trigger for new trip ID: ${tripId}. Syncing to Elastic...`);
            await syncTripToElastic(tripId);
        }
    });

    client.on("error", (err) => {
        console.error("[Worker] Postgres listener crashed:", err);
        client.release();
    });
};