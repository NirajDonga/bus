import bcrypt from "bcrypt";
import { AuthRepository } from "./auth.repo.js"
import Jwt from "jsonwebtoken";
import dns from "dns";
import { promisify } from "util";

const resolveMx = promisify(dns.resolveMx);

async function isDomainValid(email: string) {
    const domain = email.split('@')[1];
    if (!domain) return false;
    try {
        const mxRecords = await resolveMx(domain);
        return mxRecords && mxRecords.length > 0;
    } catch (err) {
        return false;
    }
}

export class AuthService {

    private authRepo = new AuthRepository();

    RegisterUser = async (email: string, phone: string, fullname: string, password: string) => {
        // Validate email domain has MX records
        const domainValid = await isDomainValid(email);
        if (!domainValid) {
            throw new Error(`Invalid email domain: ${email.split('@')[1]} cannot receive emails.`);
        }

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
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        const { password: _, ...safeUser } = user;

        return { user: safeUser, token };
    }

    getMe = async (userId: number) => {
        const user = await this.authRepo.findById(userId);
        if (!user) throw new Error("User not found");
        return user;
    }

    getUsers = async () => {
        return await this.authRepo.getAllUsers();
    }

    getUserById = async (userId: number) => {
        const user = await this.authRepo.findById(userId);
        if (!user) throw new Error(`User with ID ${userId} not found`);
        return user;
    }

    deleteUser = async (userId: number) => {
        const user = await this.authRepo.findById(userId);
        if (!user) throw new Error(`User with ID ${userId} not found`);
        return await this.authRepo.deleteUser(userId);
    }

}