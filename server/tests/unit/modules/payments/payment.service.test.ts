import "../../../helpers/env.ts";
import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { bookingRepo } from "../../../../src/modules/bookings/booking.repo.js";
import { inventoryService } from "../../../../src/modules/inventory/inventory.service.js";
import { stripe } from "../../../../src/config/stripe.js";
import { paymentService } from "../../../../src/modules/payments/payment.service.js";

describe("paymentService", () => {
    beforeEach(() => {
        (bookingRepo as any).getBookingById = async () => ({
            id: 44,
            status: "pending",
            total_amount: "1234",
            trip_id: 10,
        });
        (bookingRepo as any).updateBookingStatus = async () => ({ id: 44 });
        (bookingRepo as any).getTicketsForBooking = async () => [{ seat_number: "1A" }, { seat_number: "1B" }];
        (inventoryService as any).releaseSeatLocks = async () => undefined;
    });

    it("rejects missing bookings before creating checkout sessions", async () => {
        (bookingRepo as any).getBookingById = async () => undefined;

        await assert.rejects(paymentService.handleCreateCheckoutSession(44), /Booking not found/);
    });

    it("rejects checkout for non-pending bookings", async () => {
        (bookingRepo as any).getBookingById = async () => ({ id: 44, status: "paid", total_amount: "1234" });

        await assert.rejects(paymentService.handleCreateCheckoutSession(44), /already paid or cancelled/);
    });

    it("creates a Stripe checkout session with booking metadata and amount in paise", async () => {
        let captured: any;
        (stripe.checkout.sessions as any).create = async (input: any) => {
            captured = input;
            return { url: "https://checkout.stripe.test/session" };
        };

        const url = await paymentService.handleCreateCheckoutSession(44);

        assert.equal(url, "https://checkout.stripe.test/session");
        assert.equal(captured.line_items[0].price_data.unit_amount, 123400);
        assert.equal(captured.metadata.bookingId, "44");
        assert.equal(captured.success_url, "http://localhost:3000/booking/success?bookingId=44");
    });

    it("marks bookings paid when checkout completes", async () => {
        const updates: any[] = [];
        (stripe.webhooks as any).constructEvent = () => ({
            type: "checkout.session.completed",
            data: { object: { metadata: { bookingId: "44" }, payment_intent: "pi_123" } },
        });
        (bookingRepo as any).updateBookingStatus = async (...args: any[]) => {
            updates.push(args);
        };

        await paymentService.handleWebhook("payload", "sig", "secret");

        assert.deepEqual(updates, [[44, "paid", "pi_123"]]);
    });

    it("cancels expired checkout sessions and releases locked seats", async () => {
        const released: any[] = [];
        const updates: any[] = [];
        (stripe.webhooks as any).constructEvent = () => ({
            type: "checkout.session.expired",
            data: { object: { metadata: { bookingId: "44" } } },
        });
        (inventoryService as any).releaseSeatLocks = async (...args: any[]) => {
            released.push(args);
        };
        (bookingRepo as any).updateBookingStatus = async (...args: any[]) => {
            updates.push(args);
        };

        await paymentService.handleWebhook("payload", "sig", "secret");

        assert.deepEqual(released, [[10, ["1A", "1B"]]]);
        assert.deepEqual(updates, [[44, "cancelled"]]);
    });
});
