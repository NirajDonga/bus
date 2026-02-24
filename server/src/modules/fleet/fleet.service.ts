import { FleetRepository } from "./fleet.repo.js";
import type { LayoutBody } from "./fleet.schema.js";

class FleetService {

    private fleetRepo = new FleetRepository();

    createLayout = async (name: string, totalSeats: number, layout: LayoutBody["layout"]) => {
        return await this.fleetRepo.createLayout(name, totalSeats, layout);
    }

    getLayouts = async () => {
        return await this.fleetRepo.getAllLayouts();
    }

    getLayoutById = async (id: number) => {
        const layout = await this.fleetRepo.findLayoutById(id);
        if (!layout) throw new Error(`Layout with ID ${id} not found`);
        return layout;
    }

    updateLayout = async (id: number, name: string) => {
        const layout = await this.fleetRepo.findLayoutById(id);
        if (!layout) throw new Error(`Layout with ID ${id} not found`);
        return await this.fleetRepo.updateLayout(id, name);
    }

    deleteLayout = async (id: number) => {
        const layout = await this.fleetRepo.findLayoutById(id);
        if (!layout) throw new Error(`Layout with ID ${id} not found`);
        return await this.fleetRepo.deleteLayout(id);
    }

    // ─── Buses ────────────────────────────────────────────────────────────────

    createBus = async (plateNumber: string, operatorName: string, layoutId: number) => {
        const existingBus = await this.fleetRepo.findBusByPlate(plateNumber);
        if (existingBus) throw new Error(`Bus with plate '${plateNumber}' already exists`);

        const layout = await this.fleetRepo.findLayoutById(layoutId);
        if (!layout) throw new Error(`Layout with ID ${layoutId} not found`);

        return await this.fleetRepo.createBus(plateNumber, operatorName, layoutId);
    }

    getBuses = async () => {
        return await this.fleetRepo.getAllBuses();
    }

    getBusById = async (id: number) => {
        const bus = await this.fleetRepo.findBusById(id);
        if (!bus) throw new Error(`Bus with ID ${id} not found`);
        return bus;
    }

    updateBus = async (id: number, fields: { plateNumber?: string; operatorName?: string }) => {
        const bus = await this.fleetRepo.findBusById(id);
        if (!bus) throw new Error(`Bus with ID ${id} not found`);

        if (fields.plateNumber) {
            const conflict = await this.fleetRepo.findBusByPlate(fields.plateNumber);
            if (conflict && conflict.id !== id) {
                throw new Error(`Plate '${fields.plateNumber}' is already used by another bus`);
            }
        }

        return await this.fleetRepo.updateBus(id, fields);
    }

    deleteBus = async (id: number) => {
        const bus = await this.fleetRepo.findBusById(id);
        if (!bus) throw new Error(`Bus with ID ${id} not found`);
        return await this.fleetRepo.deleteBus(id);
    }
}

export const fleetService = new FleetService();