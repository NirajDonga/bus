import "../../../helpers/env.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SearchService } from "../../../../src/modules/search/search.service.js";

describe("SearchService", () => {
    it("attaches the matched route segment case-insensitively", async () => {
        const service: any = new SearchService();
        service.searchRepo = {
            findTripsByRouteAndDate: async () => [
                {
                    id: 1,
                    routes: [
                        { from_city: "Bengaluru", to_city: "Mysuru", price: 300 },
                        { from_city: "Bengaluru", to_city: "Chennai", price: 800 },
                    ],
                },
            ],
        };

        const [trip] = await service.searchTrips("bengaluru", "mysuru", "2026-05-01", 1, 10);

        assert.deepEqual(trip.search_route, { from_city: "Bengaluru", to_city: "Mysuru", price: 300 });
    });
});
