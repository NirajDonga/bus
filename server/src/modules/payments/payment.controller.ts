import { Request, Response } from 'express';
import { paymentService } from './payment.service.js';

export class PaymentController {
    createSession = async (req: Request, res: Response) => {
        try {
            const { bookingId } = req.body;

            if (!bookingId) {
                return res.status(400).json({ error: 'bookingId is required' });
            }

            const url = await paymentService.handleCreateCheckoutSession(bookingId);
            return res.json({ url });

        } catch (error: any) {
            console.error('Error creating checkout session:', error);
            const status = error.message.includes('not found') ? 404 :
                error.message.includes('Booking is already paid') ? 400 : 500;
            return res.status(status).json({ error: error.message || 'Internal Server Error' });
        }
    };

    webHook = async (req: Request, res: Response) => {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        try {
            if (!sig || !endpointSecret) {
                return res.status(400).send('Missing stripe signature or secret');
            }

            await paymentService.handleWebhook(req.body, sig as string, endpointSecret);

            return res.status(200).send();

        } catch (err: any) {
            console.error(`Webhook Error: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }

}

export const paymentController = new PaymentController();
