import { z } from "zod";

export const CreateBookingSchema = z.object({
    tripId: z.coerce.number().int().positive(),
    boardingStationId: z.number().int().positive(),
    droppingStationId: z.number().int().positive(),
    seatNumbers: z.array(z.string().min(1)).min(1, "At least one seat must be selected"),
    passengers: z.array(z.object({
        seatNumber: z.string(),
        name: z.string().min(2),
        age: z.number().int().positive(),
        gender: z.enum(["male", "female"]),
    }))
});

export type CreateBookingBody = z.infer<typeof CreateBookingSchema>;

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
    FAILED = 'failed'
}