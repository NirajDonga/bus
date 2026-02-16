import pool from "../../config/db.js";

export class AuthRepository {
    // check if any info about user exists?
    findExistingUser = async (email: string, phone: string) => {
        const query = 'SELECT id FROM users WHERE email = $1 OR phone = $2';
        const result = await pool.query(query, [email, phone]);
        return result.rows[0];
    }

    createUser = async (email: string, phone: string, fullname: string, password: string, role: string = 'user') => {
        const query = `
            INSERT INTO users (fullname, email, phone, password, role)
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, username, email, phone, role
        `;
        const result = await pool.query(query, [fullname, email, phone, password, role]);
        return result.rows[0];
    }

    // for login purpose    
    findByEmail = async (email: string) => {
        const query = 'SELECT id, fullname, email, password, role FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }

    findById = async (userId: number) => {
        const query = `
            SELECT id, fullname, email, phone, role 
            FROM users 
            WHERE id = $1
        `;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

}