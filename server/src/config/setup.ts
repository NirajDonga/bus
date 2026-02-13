import pool from "./db.js";
import fs from "fs";

async function setupDB() {
    try {
        const sql = fs.readFileSync('../src/sql/schema.sql', 'utf8');
        console.log('Creating tables');

        await pool.query(sql);

        console.log('table created successfully.')

    } catch (error) {
        console.error('Error creating tables:', error);
    } finally {
        await pool.end();
    }

}