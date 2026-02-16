import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";

export class AuthController {

    private authService = new AuthService();

    RegisterUser = async (req: Request, res: Response) => {
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
    }

}