import "../../helpers/env.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createMockResponse } from "../../helpers/http.ts";
import { AuthController } from "../../../src/modules/auth/auth.controller.js";

const createController = (service: Record<string, unknown>) => {
    const controller: any = new AuthController();
    controller.authService = service;
    return controller as AuthController;
};

describe("AuthController", () => {
    it("returns 400 for invalid registration payloads", async () => {
        const controller = createController({});
        const res = createMockResponse();

        await controller.RegisterUser({ body: { email: "bad" } } as any, res as any);

        assert.equal(res.statusCode, 400);
        assert.ok((res.body as any).errors);
    });

    it("returns 409 when registration hits an existing user", async () => {
        const controller = createController({
            RegisterUser: async () => {
                throw new Error("email or phone number already registered");
            },
        });
        const res = createMockResponse();

        await controller.RegisterUser({
            body: {
                email: "rider@example.com",
                phone: "9876543210",
                fullname: "Test Rider",
                password: "secret123",
            },
        } as any, res as any);

        assert.equal(res.statusCode, 409);
        assert.deepEqual(res.body, { message: "email or phone number already registered" });
    });

    it("returns a login token on success", async () => {
        const controller = createController({
            LogInUser: async () => ({
                token: "jwt-token",
                user: { id: 1, email: "rider@example.com" },
            }),
        });
        const res = createMockResponse();

        await controller.LogInUser({
            body: { email: "rider@example.com", password: "secret123" },
        } as any, res as any);

        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, {
            message: "Login successful",
            token: "jwt-token",
            user: { id: 1, email: "rider@example.com" },
        });
    });

    it("returns 401 for failed login", async () => {
        const controller = createController({
            LogInUser: async () => {
                throw new Error("Invalid credentials");
            },
        });
        const res = createMockResponse();

        await controller.LogInUser({
            body: { email: "rider@example.com", password: "bad" },
        } as any, res as any);

        assert.equal(res.statusCode, 401);
        assert.deepEqual(res.body, { message: "Invalid credentials" });
    });
});
