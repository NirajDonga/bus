import "../../helpers/env.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import jwt from "jsonwebtoken";
import { createMockResponse } from "../../helpers/http.ts";
import { adminOnly, userOnly } from "../../../src/middlewares/protect.js";

describe("protect middleware", () => {
    it("accepts a valid user bearer token", () => {
        const token = jwt.sign({ id: 7, role: "user" }, process.env.JWT_SECRET!);
        const req: any = { headers: { authorization: `Bearer ${token}` } };
        const res = createMockResponse();
        let nextCalled = false;

        userOnly(req, res as any, () => {
            nextCalled = true;
        });

        assert.equal(nextCalled, true);
        assert.equal(req.user.id, 7);
        assert.equal(req.user.role, "user");
    });

    it("rejects missing tokens", () => {
        const req: any = { headers: {} };
        const res = createMockResponse();

        userOnly(req, res as any, () => assert.fail("next should not be called"));

        assert.equal(res.statusCode, 401);
        assert.deepEqual(res.body, { message: "Unauthorized" });
    });

    it("rejects non-admin users on admin routes", () => {
        const token = jwt.sign({ id: 7, role: "user" }, process.env.JWT_SECRET!);
        const req: any = { headers: { authorization: `Bearer ${token}` } };
        const res = createMockResponse();

        adminOnly(req, res as any, () => assert.fail("next should not be called"));

        assert.equal(res.statusCode, 403);
        assert.deepEqual(res.body, { message: "No Access to Users" });
    });

    it("accepts admin users on admin routes", () => {
        const token = jwt.sign({ id: 1, role: "admin" }, process.env.JWT_SECRET!);
        const req: any = { headers: { authorization: `Bearer ${token}` } };
        const res = createMockResponse();
        let nextCalled = false;

        adminOnly(req, res as any, () => {
            nextCalled = true;
        });

        assert.equal(nextCalled, true);
        assert.equal(req.user.role, "admin");
    });
});
