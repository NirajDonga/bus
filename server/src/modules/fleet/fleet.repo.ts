import pool from "../../config/postgres.js";
import type { LayoutBody } from "./fleet.schema.js";

export class FleetRepository {

    createLayout = async (name: string, totalSeats: number, layout: LayoutBody["layout"]) => {
        const query = `
            INSERT INTO bus_layouts (name, total_seats, layout)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await pool.query(query, [name, totalSeats, JSON.stringify(layout)]);
        return result.rows[0];
    }

    getAllLayouts = async () => {
        const query = `SELECT id, name, total_seats FROM bus_layouts ORDER BY name`;
        const result = await pool.query(query);
        return result.rows;
    }

    findLayoutById = async (id: number) => {
        const query = `SELECT * FROM bus_layouts WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    updateLayout = async (id: number, name: string) => {
        const query = `
            UPDATE bus_layouts SET name = $1
            WHERE id = $2
            RETURNING *
        `;
        const result = await pool.query(query, [name, id]);
        return result.rows[0];
    }

    deleteLayout = async (id: number) => {
        const query = `DELETE FROM bus_layouts WHERE id = $1 RETURNING id`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    createBus = async (plateNumber: string, operatorName: string, layoutId: number) => {
        const query = `
            INSERT INTO buses (plate_number, operator_name, layout_id)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await pool.query(query, [plateNumber, operatorName, layoutId]);
        return result.rows[0];
    }

    getAllBuses = async () => {
        const query = `
            SELECT
                b.id,
                b.plate_number,
                b.operator_name,
                l.name AS layout_name,
                l.total_seats
            FROM buses b
            JOIN bus_layouts l ON b.layout_id = l.id
            ORDER BY b.id DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    findBusById = async (id: number) => {
        const query = `
            SELECT
                b.id,
                b.plate_number,
                b.operator_name,
                b.layout_id,
                l.name AS layout_name,
                l.total_seats,
                l.layout
            FROM buses b
            JOIN bus_layouts l ON b.layout_id = l.id
            WHERE b.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    findBusByPlate = async (plateNumber: string) => {
        const query = `SELECT id FROM buses WHERE plate_number = $1`;
        const result = await pool.query(query, [plateNumber]);
        return result.rows[0];
    }

    updateBus = async (id: number, fields: { plateNumber?: string; operatorName?: string }) => {
        const updates: string[] = [];
        const values: any[] = [];
        let i = 1;

        if (fields.plateNumber !== undefined) {
            updates.push(`plate_number = $${i++}`);
            values.push(fields.plateNumber);
        }
        if (fields.operatorName !== undefined) {
            updates.push(`operator_name = $${i++}`);
            values.push(fields.operatorName);
        }

        values.push(id);
        const query = `
            UPDATE buses SET ${updates.join(", ")}
            WHERE id = $${i}
            RETURNING *
        `;
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    deleteBus = async (id: number) => {
        const query = `DELETE FROM buses WHERE id = $1 RETURNING id`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

}