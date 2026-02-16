import pool from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, "test.sql"), "utf8");
        console.log("Seeding database...");

        await pool.query(sql);

        console.log("Seed data inserted successfully.");
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seed();
