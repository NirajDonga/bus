import { stripe } from "../../config/stripe.js"
import { bookingRepo } from '../bookings/booking.repo.js';
import { inventoryService } from '../inventory/inventory.service.js';

export class PaymentService {
    handleCreateCheckoutSession = async (bookingId: number) => {
        const booking = await bookingRepo.getBookingById(bookingId);

        if (!booking) {
            throw new Error('Booking not found');
        }

        if (booking.status !== 'pending') {
            throw new Error('Booking is already paid or cancelled');
        }

        const amount = Number(booking.total_amount);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Bus Ticket (Booking ID: ${bookingId})`,
                        },
                        unit_amount: amount * 100,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                bookingId: bookingId.toString(),
            },
            success_url: `${process.env.FRONTEND_URL}/booking/success?bookingId=${bookingId}`,
            cancel_url: `${process.env.FRONTEND_URL}/booking/failed`,
        });
        return session.url;
    }

    handleWebhook = async (payload: any, signature: string, secret: string) => {
        // 1. Verify Signature
        const event = stripe.webhooks.constructEvent(payload, signature, secret);

        // 2. Handle Event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const bookingId = Number(session.metadata?.bookingId);

                if (bookingId) {
                    const paymentIntentId = session.payment_intent as string;
                    await bookingRepo.updateBookingStatus(bookingId, 'paid', paymentIntentId);
                    console.log(`Payment successful for booking ID: ${bookingId}. Status updated to 'paid'.`);
                }
                break;
            }
            case 'checkout.session.expired': {
                const session = event.data.object as any;
                const bookingId = Number(session.metadata?.bookingId);

                if (bookingId) {
                    const booking = await bookingRepo.getBookingById(bookingId);

                    if (booking) {
                        const tickets = await bookingRepo.getTicketsForBooking(bookingId);
                        const seatNumbers = tickets.map((t: any) => t.seat_number);

                        await inventoryService.releaseSeatLocks(booking.trip_id, seatNumbers);
                    }

                    await bookingRepo.updateBookingStatus(bookingId, 'cancelled');
                    console.log(`Checkout expired for booking ID: ${bookingId}. Status updated to 'cancelled' and seats released.`);
                }
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    }
}

export const paymentService = new PaymentService();