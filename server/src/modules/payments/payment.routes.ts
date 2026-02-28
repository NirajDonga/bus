import { Router } from 'express';
import express from 'express';
import { paymentController } from './payment.controller.js';

const router = Router();

// Endpoint for frontend to call
router.post('/create-checkout-session', paymentController.createSession);

router.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    paymentController.webHook
);

export default router;
