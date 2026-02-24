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

}