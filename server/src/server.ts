import console from "node:console";
import pool from "./config/db.js";


async function test() {

    try {
        console.log("Connecting to Postgres...");

        const res = await pool.query('SELECT NOW() as current_time');

        console.log('Connection Successful');
        console.log('Time:', res.rows[0].current_time);
    } catch (err) {
        console.log("Connection Failed");
    } finally {
        await pool.end();
    }

}

test()