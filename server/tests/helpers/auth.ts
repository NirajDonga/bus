import jwt from "jsonwebtoken";

export const bearerToken = (payload: { id: number; role: string }) =>
    `Bearer ${jwt.sign(payload, process.env.JWT_SECRET!)}`;
