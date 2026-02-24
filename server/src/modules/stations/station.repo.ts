import pool from "../../config/postgres.js";


export class StationRepository {

    createStation = async (name: string, city: string, state: string, latitude?: number, longitude?: number) => {
        const query = `
            INSERT INTO stations (name, city, state, latitude, longitude)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const result = await pool.query(query, [name, city, state, latitude ?? null, longitude ?? null]);
        return result.rows[0];
    }

    findAll = async () => {
        const query = `SELECT * FROM stations ORDER BY city, name`;
        const result = await pool.query(query);
        return result.rows;
    }

    findByNameAndCity = async (name: string, city: string) => {
        const query = `SELECT id FROM stations WHERE name = $1 AND city = $2`;
        const result = await pool.query(query, [name, city]);
        return result.rows[0];
    }

}