import { Router } from "express";
import { StationController } from "./station.controller.js";
import { adminOnly } from "../../middlewares/protect.js";

const router = Router();
const stationController = new StationController();

router.get("/", stationController.getAll);
router.post("/", adminOnly, stationController.createStation);

export default router;