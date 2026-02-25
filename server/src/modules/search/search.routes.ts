import { Router } from "express";
import { searchController } from "./search.controller.js";

const router = Router();

// This defines the GET /api/search endpoint
router.get("/", searchController.search);

export default router;
