import { Request, Response } from "express";
import { tripService } from "./trip.service.js";
import { CreateTripSchema, UpdateTripSchema } from "./trip.schema.js";

class TripController {

    createTrip = async (req: Request, res: Response) => {
        const parsed = CreateTripSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
            return;
        }

        try {
            const data = await tripService.createTrip(parsed.data);
            res.status(201).json(data);
        } catch (error: any) {
            const msg = error.message;
            const status = msg.includes("already scheduled") ? 409 : msg.includes("not found") ? 404 : 500;
            res.status(status).json({ message: msg });
        }
    }

    getAllTrips = async (req: Request, res: Response) => {
        try {
            const data = await tripService.getAllTrips();
            res.status(200).json(data);
        } catch (error: any) {
            res.status(500).json({ message: "Failed to fetch trips", error: error.message });
        }
    }

    getTripById = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) { res.status(400).json({ message: "Invalid trip ID" }); return; }

        try {
            const data = await tripService.getTripById(id);
            res.status(200).json(data);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    updateTrip = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) { res.status(400).json({ message: "Invalid trip ID" }); return; }

        const parsed = UpdateTripSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
            return;
        }

        try {
            const data = await tripService.updateTrip(id, parsed.data);
            res.status(200).json(data);
        } catch (error: any) {
            const msg = error.message;
            const status = msg.includes("not found") ? 404 : msg.includes("conflicts") ? 409 : 500;
            res.status(status).json({ message: msg });
        }
    }

    deleteTrip = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) { res.status(400).json({ message: "Invalid trip ID" }); return; }

        try {
            await tripService.deleteTrip(id);
            res.status(200).json({ message: `Trip ${id} deleted` });
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }
}

export const tripController = new TripController();
