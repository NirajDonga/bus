import "../../helpers/env.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LoginSchema, RegisterSchema } from "../../../src/modules/auth/auth.schema.js";

describe("auth schemas", () => {
    it("accepts a complete registration payload", () => {
        const parsed = RegisterSchema.safeParse({
            email: "rider@example.com",
            phone: "9876543210",
            fullname: "Test Rider",
            password: "secret123",
        });

        assert.equal(parsed.success, true);
    });

    it("rejects invalid registration fields", () => {
        const parsed = RegisterSchema.safeParse({
            email: "not-an-email",
            phone: "123",
            fullname: "A",
            password: "short",
        });

        assert.equal(parsed.success, false);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            assert.ok(errors.email);
            assert.ok(errors.phone);
            assert.ok(errors.fullname);
            assert.ok(errors.password);
        }
    });

    it("requires login email and password", () => {
        const parsed = LoginSchema.safeParse({
            email: "rider@example.com",
        });

        assert.equal(parsed.success, false);
        if (!parsed.success) {
            assert.ok(parsed.error.flatten().fieldErrors.password);
        }
    });
});
