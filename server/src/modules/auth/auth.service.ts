import bcrypt from "bcrypt";
import { AuthRepository } from "./auth.repo.js"
import Jwt from "jsonwebtoken";


export class AuthService {

    private authRepo = new AuthRepository();

    RegisterUser = async (email: string, phone: string, fullname: string, password: string) => {
        const exists = await this.authRepo.findExistingUser(email, phone);
        if (exists) {
            throw new Error('email or phone number already registered');
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const user = await this.authRepo.createUser(email, phone, fullname, hash);

        return { user };
    }

    LogInUser = async (email: string, password: string) => {
        const user = await this.authRepo.findByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Invalid credentials');
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT Secret not found');
        }

        const token = Jwt.sign(
            { id: user.id, role: user.role, name: user.fullname },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return { user, token };
    }



}