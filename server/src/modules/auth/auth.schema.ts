import { z } from "zod";

export const RegisterSchema = z.object({
    fullname: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const LoginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

export type RegisterBody = z.infer<typeof RegisterSchema>;

export type UserPublic = {
    id: number;
    fullname: string;
    email: string;
    phone: string;
    role: "user" | "admin";
};

export type UserLogin = {
    id: number;
    fullname: string;
    email: string;
    password: string;
    role: "user" | "admin";
};
