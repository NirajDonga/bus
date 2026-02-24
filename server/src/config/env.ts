import { z } from "zod";

const EnvSchema = z.object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
    PORT: z.string().regex(/^\d+$/, "PORT must be a number").optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("Invalid environment variables:\n");
    const errors = parsed.error.flatten().fieldErrors;
    for (const [key, messages] of Object.entries(errors)) {
        console.error(`  ${key}: ${messages?.join(", ")}`);
    }
    process.exit(1);
}

export const env = parsed.data;
