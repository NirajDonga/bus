import "../../helpers/env.ts";
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import searchRoutes from "../../../src/modules/search/search.routes.js";
import { searchService } from "../../../src/modules/search/search.service.js";
import { createTestApi, TestApi } from "../../helpers/api.ts";

const originalSearchTrips = searchService.searchTrips;

describe("search routes", () => {
    let api: TestApi;

    before(async () => {
        (searchService as any).searchTrips = async () => [{ id: 1, operator_name: "Swift Travels" }];
        api = await createTestApi(searchRoutes, "/api/search");
    });

    after(async () => {
        await api.close();
        searchService.searchTrips = originalSearchTrips;
    });

    it("returns 400 for invalid search query", async () => {
        const response = await api.request("GET", "/?from_city=A");

        assert.equal(response.status, 400);
        assert.ok(response.body.errors);
    });

    it("rejects same origin and destination", async () => {
        const response = await api.request("GET", "/?from_city=Bengaluru&to_city=bengaluru&date=2026-05-01");

        assert.equal(response.status, 400);
        assert.deepEqual(response.body, { message: "Origin and destination cannot be the same" });
    });

    it("returns paginated search results", async () => {
        const response = await api.request("GET", "/?from_city=Bengaluru&to_city=Mysuru&date=2026-05-01&page=2&limit=5");

        assert.equal(response.status, 200);
        assert.deepEqual(response.body, {
            page: 2,
            limit: 5,
            count: 1,
            data: [{ id: 1, operator_name: "Swift Travels" }],
        });
    });
});
