import pool from "../../config/db.js";
import { UserPublic, UserLogin } from "./auth.schema.js";

export class AuthRepository {
    findExistingUser = async (email: string, phone: string): Promise<{ id: number } | undefined> => {
        const query = 'SELECT id FROM users WHERE email = $1 OR phone = $2';
        const result = await pool.query(query, [email, phone]);
        return result.rows[0];
    }

    createUser = async (email: string, phone: string, fullname: string, password: string, role: string = 'user'): Promise<UserPublic> => {
        const query = `
            INSERT INTO users (fullname, email, phone, password, role)
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, fullname, email, phone, role
        `;
        const result = await pool.query(query, [fullname, email, phone, password, role]);
        return result.rows[0];
    }

    findByEmail = async (email: string): Promise<UserLogin | undefined> => {
        const query = 'SELECT id, fullname, email, password, role FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }

    findById = async (userId: number): Promise<UserPublic | undefined> => {
        const query = `
            SELECT id, fullname, email, phone, role 
            FROM users 
            WHERE id = $1
        `;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

    getAllUsers = async (): Promise<UserPublic[]> => {
        const query = `SELECT id, fullname, email, phone, role FROM users ORDER BY id`;
        const result = await pool.query(query);
        return result.rows;
    }

    deleteUser = async (userId: number): Promise<{ id: number } | undefined> => {
        const query = `DELETE FROM users WHERE id = $1 RETURNING id`;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

}