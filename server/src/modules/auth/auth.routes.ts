import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { userOnly, adminOnly } from "../../middlewares/protect.js";

const router = Router();
const authController = new AuthController();

// Public
router.post("/register", authController.RegisterUser);
router.post("/login", authController.LogInUser);

// Protected: any logged-in user
router.get("/me", userOnly, authController.getMe);

// Protected: admin only
router.get("/users", adminOnly, authController.getUsers);
router.get("/users/:id", adminOnly, authController.getUserById);
router.delete("/users/:id", adminOnly, authController.deleteUser);

export default router;