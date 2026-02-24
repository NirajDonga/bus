import { Request, Response } from "express";
import { fleetService } from "./fleet.service.js";
import { LayoutBodySchema, BusBodySchema, UpdateLayoutSchema, UpdateBusSchema } from "./fleet.schema.js";

class FleetController {

    createLayout = async (req: Request, res: Response) => {
        const parsed = LayoutBodySchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
            return;
        }

        try {
            const { name, totalSeats, layout } = parsed.data;
            const data = await fleetService.createLayout(name, totalSeats, layout);
            res.status(201).json(data);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    getLayouts = async (req: Request, res: Response) => {
        try {
            const data = await fleetService.getLayouts();
            res.status(200).json(data);
        } catch (error: any) {
            res.status(500).json({ message: "Failed to fetch layouts" });
        }
    }

    getLayoutById = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) { res.status(400).json({ message: "Invalid layout ID" }); return; }
        try {
            const data = await fleetService.getLayoutById(id);
            res.status(200).json(data);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    updateLayout = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) { res.status(400).json({ message: "Invalid layout ID" }); return; }

        const parsed = UpdateLayoutSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
            return;
        }
        try {
            const data = await fleetService.updateLayout(id, parsed.data.name);
            res.status(200).json(data);
        } catch (error: any) {
            res.status(error.message.includes("not found") ? 404 : 500).json({ message: error.message });
        }
    }

    deleteLayout = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) { res.status(400).json({ message: "Invalid layout ID" }); return; }
        try {
            await fleetService.deleteLayout(id);
            res.status(200).json({ message: `Layout ${id} deleted` });
        } catch (error: any) {
            res.status(error.message.includes("not found") ? 404 : 500).json({ message: error.message });
        }
    }

    createBus = async (req: Request, res: Response) => {
        const parsed = BusBodySchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
            return;
        }

        try {
            const { plateNumber, operatorName, layoutId } = parsed.data;
            const data = await fleetService.createBus(plateNumber, operatorName, layoutId);
            res.status(201).json(data);
        } catch (error: any) {
            const isDuplicate = error.message?.toLowerCase().includes("already exists");
            res.status(isDuplicate ? 409 : 500).json({ message: error.message });
        }
    }

    getBuses = async (req: Request, res: Response) => {
        try {
            const data = await fleetService.getBuses();
            res.status(200).json(data);
        } catch (error: any) {
            res.status(500).json({ message: "Failed to fetch buses" });
        }
    }

    getBusById = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) { res.status(400).json({ message: "Invalid bus ID" }); return; }
        try {
            const data = await fleetService.getBusById(id);
            res.status(200).json(data);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    updateBus = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) { res.status(400).json({ message: "Invalid bus ID" }); return; }

        const parsed = UpdateBusSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten() });
            return;
        }
        try {
            const data = await fleetService.updateBus(id, parsed.data);
            res.status(200).json(data);
        } catch (error: any) {
            const isNotFound = error.message.includes("not found");
            const isDuplicate = error.message.includes("already used");
            res.status(isNotFound ? 404 : isDuplicate ? 409 : 500).json({ message: error.message });
        }
    }

    deleteBus = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) { res.status(400).json({ message: "Invalid bus ID" }); return; }
        try {
            await fleetService.deleteBus(id);
            res.status(200).json({ message: `Bus ${id} deleted` });
        } catch (error: any) {
            res.status(error.message.includes("not found") ? 404 : 500).json({ message: error.message });
        }
    }
}

export const fleetController = new FleetController();