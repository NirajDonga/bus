import pool from "../../config/postgres.js";

export interface CreateTicketDTO {
    seatNumber: string;
    passengerName: string;
    passengerAge: number;
    passengerGender: string;
    boardSeq: number;
    dropSeq: number;
    pricePaid: number;
}

export interface CreateBookingDTO {
    userId: number;
    tripId: number;
    totalAmount: number;
    tickets: CreateTicketDTO[];
    expiresAt: Date;
}

export class BookingRepository {
    async createPendingBooking(data: CreateBookingDTO) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const bookingResult = await client.query(
                `INSERT INTO bookings (user_id, trip_id, status, total_amount, expires_at) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [data.userId, data.tripId, 'pending', data.totalAmount, data.expiresAt]
            );

            const booking = bookingResult.rows[0];

            for (const ticket of data.tickets) {
                await client.query(
                    `INSERT INTO tickets (booking_id, trip_id, seat_number, passenger_name, passenger_age, passenger_gender, board_seq, drop_seq, price_paid, status) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [
                        booking.id,
                        data.tripId,
                        ticket.seatNumber,
                        ticket.passengerName,
                        ticket.passengerAge,
                        ticket.passengerGender,
                        ticket.boardSeq,
                        ticket.dropSeq,
                        ticket.pricePaid,
                        'pending'
                    ]
                );
            }

            // Bump trip updated_at to trigger the Postgres LISTEN/NOTIFY for Elasticsearch sync worker
            await client.query(`UPDATE trips SET updated_at = NOW() WHERE id = $1`, [data.tripId]);

            await client.query('COMMIT');
            return booking;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updateBookingStatus(bookingId: number, status: string, paymentId?: string) {
        const query = `
            UPDATE bookings 
            SET status = $1, payment_id = COALESCE($2, payment_id), updated_at = NOW() 
            WHERE id = $3 RETURNING *
        `;
        const result = await pool.query(query, [status, paymentId || null, bookingId]);

        await pool.query(
            `UPDATE tickets SET status = $1, updated_at = NOW() WHERE booking_id = $2`,
            [status, bookingId]
        );

        // Notify Elasticsearch sync worker by updating the trip
        const booking = result.rows[0];
        if (booking && booking.trip_id) {
            await pool.query(`UPDATE trips SET updated_at = NOW() WHERE id = $1`, [booking.trip_id]);
        }

        return booking;
    }
}

export const bookingRepo = new BookingRepository();
