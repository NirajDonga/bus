import { elasticClient } from "../../config/elastic.js";

export class SearchRepository {
    findTripsByRouteAndDate = async (fromCity: string, toCity: string, date: string, page: number, limit: number) => {
        const skip = (page - 1) * 10;
        const response = await elasticClient.search({
            index: "trips",
            from: skip,
            size: limit,
            query: {
                bool: {
                    must: [
                        {
                            range: {
                                departure_time: {
                                    gte: `${date}T00:00:00.000Z`,
                                    lte: `${date}T23:59:59.999Z`
                                }
                            }
                        },
                        {
                            nested: {
                                path: "schedule",
                                query: { match: { "schedule.station_city": fromCity } }
                            }
                        },
                        {
                            nested: {
                                path: "schedule",
                                query: { match: { "schedule.station_city": toCity } }
                            }
                        }
                    ]
                }
            }
        });

        return response.hits.hits.map(hit => hit._source as any);
    }
}
