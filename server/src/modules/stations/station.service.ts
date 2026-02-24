import { StationRepo } from "./station.repo.js";


export class StationService {

    private stationRepo = new StationRepo();


    createStation = async (name: string, city: string, state: string, latitude?: number, longitude?: number) => {
        const existing = await this.stationRepo.findByNameAndCity(name, city);
        if (existing) {
            throw new Error(`Station '${name}' in '${city}' already exists.`);
        }

        return await this.stationRepo.createStation(name, city, state, latitude, longitude);
    }

    getAllStations = async () => {
        return await this.stationRepo.findAll();
    }
}
