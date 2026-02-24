import { z } from "zod";

export const SeatSchema = z.object({
    id: z.string().min(1),                  // e.g. "1A", "U2B"
    deck: z.enum(["upper", "lower"]),       // which deck the seat is on
    type: z.enum(["sleeper", "seater"]),    // seat type
    row: z.number().int().positive(),       // grid row position
    col: z.number().int().positive(),       // grid col position
});

export type Seat = z.infer<typeof SeatSchema>;


export const LayoutBodySchema = z
    .object({
        name: z.string().min(1, "Name is required"),
        totalSeats: z
            .number()
            .int()
            .positive("totalSeats must be a positive integer"),
        layout: z.object({
            seats: z.array(SeatSchema).min(1, "Layout must have at least one seat"),
        }),
    })
    .superRefine((data, ctx) => {
        if (data.layout.seats.length !== data.totalSeats) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Seat count mismatch: totalSeats is ${data.totalSeats} but layout has ${data.layout.seats.length} seat(s)`,
                path: ["totalSeats"],
            });
        }
    });

export type LayoutBody = z.infer<typeof LayoutBodySchema>;

export const BusBodySchema = z.object({
    plateNumber: z.string().min(1, "Plate number is required"),
    operatorName: z.string().min(1, "Operator name is required"),
    layoutId: z
        .number()
        .int()
        .positive("layoutId must be a positive integer"),
});

export type BusBody = z.infer<typeof BusBodySchema>;

export const UpdateLayoutSchema = z.object({
    name: z.string().min(1, "Name is required"),
});

export type UpdateLayoutBody = z.infer<typeof UpdateLayoutSchema>;

export const UpdateBusSchema = z.object({
    plateNumber: z.string().min(1).optional(),
    operatorName: z.string().min(1).optional(),
}).refine(
    (data) => data.plateNumber !== undefined || data.operatorName !== undefined,
    { message: "At least one field (plateNumber or operatorName) must be provided" }
);

export type UpdateBusBody = z.infer<typeof UpdateBusSchema>;
