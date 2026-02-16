import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";

export class AuthController {

    private authService = new AuthService();

    RegisterUser = async (req: Request, res: Response) => {
        try {
            const { email, phone, fullname, password } = req.body;
            if (!fullname || !email || !phone || !password) {
                res.status(400).json({ message: 'Missing required fields' });
                return;
            }

            const { user } = await this.authService.RegisterUser(email, phone, fullname, password);
            res.status(201).json({
                message: 'User registered successfully',
                user: user
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    LogInUser = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ message: 'Missing required fields' });
                return
            }

            const { user, token } = await this.authService.LogInUser(email, password);
            res.status(200).json({
                message: 'Login successful',
                token: token,
                user: user
            })
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

}