import { Request, Response } from "express";
import { StationService } from "./station.service.js";
import { StationBodySchema } from "./station.schema.js";

export class StationController {

    private stationService = new StationService();

    createStation = async (req: Request, res: Response) => {
        const parsed = StationBodySchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
            return;
        }

        try {
            const { name, city, state, latitude, longitude } = parsed.data;
            const station = await this.stationService.createStation(name, city, state, latitude, longitude);
            res.status(201).json(station);
        } catch (error: any) {
            const isDuplicate = error.message?.toLowerCase().includes("already exists");
            res.status(isDuplicate ? 409 : 500).json({ message: error.message });
        }
    }

    getAll = async (req: Request, res: Response) => {
        try {
            const stations = await this.stationService.getAllStations();
            res.status(200).json(stations);
        } catch (error: any) {
            res.status(500).json({ message: "Failed to fetch stations" });
        }
    }

}