import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface UserPayload extends JwtPayload {
    id: number;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}

const extractInfo = (tokenStr: string): UserPayload | null => {
    try {
        const token = tokenStr.split(" ");
        if (token[0] !== "Bearer") {
            return null;
        }

        const decoded = jwt.verify(token[1], process.env.JWT_SECRET!) as UserPayload;

        if (!decoded.id || !decoded.role) {
            return null;
        }

        return decoded;
    } catch (error) {
        console.error("Failed to decode JWT:", error);
        return null;
    }
};

export const userOnly = (req: Request, res: Response, next: NextFunction) => {
    const user = extractInfo(req.headers.authorization || "");
    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    req.user = user;
    next();
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    const user = extractInfo(req.headers.authorization || "");
    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    if (user.role != "admin") {
        res.status(403).json({ message: "No Access to Users" });
        return;
    }

    req.user = user;
    next();
}