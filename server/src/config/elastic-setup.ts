import { elasticClient } from "./elastic.js";

export async function createTripsIndex() {
    const indexName = "trips";

    try {
        const exists = await elasticClient.indices.exists({ index: indexName });
        if (exists) {
            console.log(`Index '${indexName}' already exists.`);
            return;
        }

        await elasticClient.indices.create({
            index: indexName,
            mappings: {
                properties: {
                    id: { type: "integer" },
                    departure_time: { type: "date" },
                    arrival_time: { type: "date" },

                    bus: {
                        properties: {
                            plate_number: { type: "keyword" },
                            operator_name: { type: "text" }
                        }
                    },

                    schedule: {
                        type: "nested",
                        properties: {
                            stop_id: { type: "integer" },
                            station_name: { type: "text" },
                            station_city: { type: "keyword" }, // Keyword for exact matching
                            arrival: { type: "keyword" },      // e.g. "10:00"
                            departure: { type: "keyword" },    // e.g. "10:15"
                            sequence: { type: "integer" }      // guarantees traveling forward
                        }
                    }
                }
            }
        });

        console.log(`Index '${indexName}' created successfully.`);
    } catch (error) {
        console.error(`Error creating index '${indexName}':`, error);
    }
}
