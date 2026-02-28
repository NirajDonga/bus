import pool from "../config/postgres.js";
import { bookingRepo } from "../modules/bookings/booking.repo.js";
import { inventoryService } from "../modules/inventory/inventory.service.js";

export const startAbandonedBookingWorker = () => {
    console.log("Starting abandoned booking cleanup worker...");

    // Run every 5 minutes
    setInterval(async () => {
        try {
            // Find all pending bookings where expires_at is in the past
            const result = await pool.query(`
                SELECT id, trip_id 
                FROM bookings 
                WHERE status = 'pending' AND expires_at < NOW()
            `);

            const abandonedBookings = result.rows;

            if (abandonedBookings.length > 0) {
                console.log(`Found ${abandonedBookings.length} abandoned bookings. Cleaning up...`);

                for (const booking of abandonedBookings) {
                    try {
                        const tickets = await bookingRepo.getTicketsForBooking(booking.id);
                        const seatNumbers = tickets.map((t: any) => t.seat_number);

                        // Release the seat locks manually just in case
                        if (seatNumbers.length > 0) {
                            await inventoryService.releaseSeatLocks(booking.trip_id, seatNumbers);
                        }

                        // Mark booking as cancelled
                        await bookingRepo.updateBookingStatus(booking.id, 'cancelled');

                        console.log(`Successfully cancelled abandoned booking ID: ${booking.id}`);
                    } catch (err) {
                        console.error(`Failed to clean up abandoned booking ID: ${booking.id}`, err);
                    }
                }
            }
        } catch (error) {
            console.error("Error running abandoned booking worker:", error);
        }
    }, 5 * 60 * 1000); 
}
