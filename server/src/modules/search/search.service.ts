import { SearchRepository } from "./search.repo.js";

export class SearchService {
    private searchRepo = new SearchRepository();

    searchTrips = async (fromCity: string, toCity: string, date: string, page: number, limit: number) => {
        const rawTrips = await this.searchRepo.findTripsByRouteAndDate(fromCity, toCity, date, page, limit);

        // Enhance response by pulling the specific route info out for the frontend
        return rawTrips.map(trip => {
            const routeInfo = trip.routes?.find((r: any) =>
                r.from_city.toLowerCase() === fromCity.toLowerCase() &&
                r.to_city.toLowerCase() === toCity.toLowerCase()
            );

            return {
                ...trip,
                search_route: routeInfo
            };
        });
    }
}

export const searchService = new SearchService();
