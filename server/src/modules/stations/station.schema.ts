import { z } from "zod";

export const StationBodySchema = z.object({
    name: z.string().min(2, "Station name must be at least 2 characters"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
});

export type StationBody = z.infer<typeof StationBodySchema>;
