import { Request, Response } from "express";
import { bookingService } from "./booking.service.js";
import { CreateBookingSchema } from "./booking.schema.js";
import { ZodError } from "zod";

export class BookingController {
    reserveSeats = async (req: Request, res: Response) => {
        try {
            const userId = req.user!.id;

            const validatedData = CreateBookingSchema.parse(req.body);

            const bookingResult = await bookingService.reserveSeats(userId, validatedData);

            res.status(201).json({
                success: true,
                message: "Seats reserved successfully. Please complete payment within the next 10 minutes.",
                data: bookingResult
            });

        } catch (error: unknown) {
            console.error("[Booking Controller] Reserve Seats Error:", error);

            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: (error as any).errors
                });
                return;
            }

            res.status((error as any).status || 500).json({
                success: false,
                message: (error as any).message || "An unexpected error occurred during reservation"
            });
        }
    }
}

export const bookingController = new BookingController();
