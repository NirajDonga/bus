import "../../helpers/env.ts";
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { createMockResponse } from "../../helpers/http.ts";
import { paymentController } from "../../../src/modules/payments/payment.controller.js";
import { paymentService } from "../../../src/modules/payments/payment.service.js";

const originalHandleCreateCheckoutSession = paymentService.handleCreateCheckoutSession;
const originalHandleWebhook = paymentService.handleWebhook;
const originalConsoleError = console.error;

describe("paymentController", () => {
    beforeEach(() => {
        (paymentService as any).handleCreateCheckoutSession = async () => "https://checkout.stripe.test/session";
        (paymentService as any).handleWebhook = async () => undefined;
        console.error = () => undefined;
    });

    afterEach(() => {
        paymentService.handleCreateCheckoutSession = originalHandleCreateCheckoutSession;
        paymentService.handleWebhook = originalHandleWebhook;
        console.error = originalConsoleError;
    });

    it("requires bookingId before creating checkout sessions", async () => {
        const res = createMockResponse();

        await paymentController.createSession({ body: {} } as any, res as any);

        assert.equal(res.statusCode, 400);
        assert.deepEqual(res.body, { error: "bookingId is required" });
    });

    it("returns checkout url on success", async () => {
        const res = createMockResponse();

        await paymentController.createSession({ body: { bookingId: 12 } } as any, res as any);

        assert.deepEqual(res.body, { url: "https://checkout.stripe.test/session" });
    });

    it("maps missing bookings to 404", async () => {
        (paymentService as any).handleCreateCheckoutSession = async () => {
            throw new Error("Booking not found");
        };
        const res = createMockResponse();

        await paymentController.createSession({ body: { bookingId: 12 } } as any, res as any);

        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { error: "Booking not found" });
    });

    it("requires a Stripe signature and webhook secret", async () => {
        const previousSecret = process.env.STRIPE_WEBHOOK_SECRET;
        delete process.env.STRIPE_WEBHOOK_SECRET;
        const res = createMockResponse();

        await paymentController.webHook({ headers: {}, body: Buffer.from("{}") } as any, res as any);

        process.env.STRIPE_WEBHOOK_SECRET = previousSecret;
        assert.equal(res.statusCode, 400);
        assert.equal(res.sent, "Missing stripe signature or secret");
    });
});
