import { Request, Response } from "express";
import { StationService } from "./station.service.js";

export class StationController {

    private stationService = new StationService();

    createStation = async (req: Request, res: Response) => {
        try {
            const { name, city, state } = req.body;

            if (!name || !city || !state) {
                res.status(400).json({ message: "Name, City, and State are required" });
                return;
            }

            const station = await this.stationService.createStation(name, city, state);
            res.status(201).json(station);

        } catch (error: any) {
            res.status(400).json({ message: error.message });
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