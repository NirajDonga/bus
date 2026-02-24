import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { RegisterSchema, LoginSchema } from "./auth.schema.js";

export class AuthController {

    private authService = new AuthService();

    RegisterUser = async (req: Request, res: Response) => {
        const parsed = RegisterSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
            return;
        }

        try {
            const { email, phone, fullname, password } = parsed.data;
            const { user } = await this.authService.RegisterUser(email, phone, fullname, password);
            res.status(201).json({ message: "User registered successfully", user });
        } catch (error: any) {
            const isDuplicate = error.message?.toLowerCase().includes("already registered");
            res.status(isDuplicate ? 409 : 500).json({ message: error.message });
        }
    }

    LogInUser = async (req: Request, res: Response) => {
        const parsed = LoginSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
            return;
        }

        try {
            const { email, password } = parsed.data;
            const { user, token } = await this.authService.LogInUser(email, password);
            res.status(200).json({ message: "Login successful", token, user });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    getMe = async (req: Request, res: Response) => {
        try {
            const user = await this.authService.getMe(req.user!.id);
            res.status(200).json(user);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    getUsers = async (req: Request, res: Response) => {
        try {
            const users = await this.authService.getUsers();
            res.status(200).json(users);
        } catch (error: any) {
            res.status(500).json({ message: "Failed to fetch users" });
        }
    }

    getUserById = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) { res.status(400).json({ message: "Invalid user ID" }); return; }
        try {
            const user = await this.authService.getUserById(id);
            res.status(200).json(user);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    deleteUser = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) { res.status(400).json({ message: "Invalid user ID" }); return; }
        try {
            await this.authService.deleteUser(id);
            res.status(200).json({ message: `User ${id} deleted` });
        } catch (error: any) {
            res.status(error.message.includes("not found") ? 404 : 500).json({ message: error.message });
        }
    }

}