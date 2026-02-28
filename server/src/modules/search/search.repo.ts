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
                                path: "routes",
                                query: {
                                    bool: {
                                        must: [
                                            { match: { "routes.from_city": fromCity } },
                                            { match: { "routes.to_city": toCity } },
                                            { range: { "routes.available_seats": { gt: 0 } } }
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        });

        return response.hits.hits.map(hit => hit._source as any);
    }
}
