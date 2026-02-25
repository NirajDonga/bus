import { SearchRepository } from "./search.repo.js";

export class SearchService {
    private searchRepo = new SearchRepository();

    searchTrips = async (fromCity: string, toCity: string, date: string, page: number, limit: number) => {
        const rawTrips = await this.searchRepo.findTripsByRouteAndDate(fromCity, toCity, date, page, limit);

        const forwardTrips = rawTrips.filter(trip => {
            const boardingPoint = trip.schedule.find((s: any) => s.station_city.toLowerCase() === fromCity.toLowerCase());
            const droppingPoint = trip.schedule.find((s: any) => s.station_city.toLowerCase() === toCity.toLowerCase());

            if (!boardingPoint || !droppingPoint) return false;

            return boardingPoint.sequence < droppingPoint.sequence;
        });

        return forwardTrips;
    }
}

export const searchService = new SearchService();
