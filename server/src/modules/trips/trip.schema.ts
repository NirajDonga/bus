import { z } from "zod";

// ─── Schedule Item ───────────────────────────────────────────────────────────

export const ScheduleItemSchema = z.object({
    stop_id: z.number().int().positive(),
    arrival: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:mm format (e.g., 10:00)"),
    departure: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:mm format (e.g., 10:15)"),
});

// ─── Trip Creation ───────────────────────────────────────────────────────────

export const CreateTripSchema = z.object({
    busId: z.number().int().positive(),
    firstStop: z.number().int().positive(),
    lastStop: z.number().int().positive(),
    departureTime: z.string().datetime({ offset: true, message: "Must be a valid ISO 8601 datetime string" }),
    arrivalTime: z.string().datetime({ offset: true, message: "Must be a valid ISO 8601 datetime string" }),
    schedule: z.array(ScheduleItemSchema).min(2, "A trip must have at least two stops in its schedule"),
});

export type CreateTripBody = z.infer<typeof CreateTripSchema>;

// ─── Trip Update ─────────────────────────────────────────────────────────────

export const UpdateTripSchema = z.object({
    status: z.enum(["scheduled", "ongoing", "completed", "cancelled"]).optional(),
    departureTime: z.string().datetime({ offset: true }).optional(),
    arrivalTime: z.string().datetime({ offset: true }).optional(),
    schedule: z.array(ScheduleItemSchema).min(2).optional(),
});

export type UpdateTripBody = z.infer<typeof UpdateTripSchema>;
