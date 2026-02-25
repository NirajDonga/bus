import { elasticClient } from "../config/elastic.js";
import pool from "../config/postgres.js";

const syncTripToElastic = async (tripId: number) => {
    try {
        const query = `
            SELECT 
                t.*, 
                b.plate_number, 
                b.operator_name
            FROM trips t
            JOIN buses b ON t.bus_id = b.id
            WHERE t.id = $1
        `;
        const result = await pool.query(query, [tripId]);

        if (result.rows.length === 0) {
            await elasticClient.delete({ index: "trips", id: String(tripId) }).catch(() => { });
            return;
        }

        const pgTrip = result.rows[0];

        const stopIds = pgTrip.schedule.map((s: any) => s.stop_id);
        const stationsQuery = `SELECT id, name, city FROM stations WHERE id = ANY($1)`;
        const { rows: stations } = await pool.query(stationsQuery, [stopIds]);

        const enrichedSchedule = pgTrip.schedule.map((stop: any, index: number) => {
            const station = stations.find(s => s.id === stop.stop_id) || { name: "Unknown", city: "Unknown" };

            return {
                ...stop,
                station_name: station.name,
                station_city: station.city,
                sequence: index + 1
            };
        });

        const elasticDocument = {
            id: pgTrip.id,
            departure_time: pgTrip.departure_time,
            arrival_time: pgTrip.arrival_time,
            bus: {
                plate_number: pgTrip.plate_number,
                operator_name: pgTrip.operator_name
            },
            schedule: enrichedSchedule
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