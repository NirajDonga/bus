import "../../../helpers/env.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthService } from "../../../../src/modules/auth/auth.service.js";

const createService = (repo: Record<string, unknown>) => {
    const service: any = new AuthService();
    service.authRepo = repo;
    return service as AuthService;
};

describe("AuthService", () => {
    it("rejects registration when the email domain has no MX records", async () => {
        const repo = {
            findExistingUser: async () => assert.fail("database should not be checked for invalid domains"),
        };
        const service = createService(repo);

        await assert.rejects(
            service.RegisterUser("rider@invalid.test", "9876543210", "Test Rider", "secret123"),
            /Invalid email domain/
        );
    });

    it("rejects invalid login credentials", async () => {
        const password = await bcrypt.hash("secret123", 4);
        const service = createService({
            findByEmail: async () => ({
                id: 1,
                fullname: "Test Rider",
                email: "rider@example.com",
                password,
                role: "user",
            }),
        });

        await assert.rejects(service.LogInUser("rider@example.com", "wrong-password"), /Invalid credentials/);
    });

    it("returns a token and omits the password on successful login", async () => {
        const password = await bcrypt.hash("secret123", 4);
        const service = createService({
            findByEmail: async () => ({
                id: 1,
                fullname: "Test Rider",
                email: "rider@example.com",
                password,
                role: "user",
            }),
        });

        const result = await service.LogInUser("rider@example.com", "secret123");
        const decoded = jwt.verify(result.token, process.env.JWT_SECRET!) as any;

        assert.equal(result.user.email, "rider@example.com");
        assert.equal("password" in result.user, false);
        assert.equal(decoded.id, 1);
        assert.equal(decoded.role, "user");
    });

    it("throws when getMe cannot find a user", async () => {
        const service = createService({ findById: async () => undefined });

        await assert.rejects(service.getMe(99), /User not found/);
    });

    it("checks existence before deleting a user", async () => {
        const calls: string[] = [];
        const service = createService({
            findById: async () => {
                calls.push("findById");
                return { id: 2, fullname: "Admin", email: "admin@example.com", phone: "9876543210", role: "admin" };
            },
            deleteUser: async () => {
                calls.push("deleteUser");
                return { id: 2 };
            },
        });

        const deleted = await service.deleteUser(2);

        assert.deepEqual(calls, ["findById", "deleteUser"]);
        assert.deepEqual(deleted, { id: 2 });
    });
});
