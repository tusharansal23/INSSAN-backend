import { Router } from "express";
const router = Router();
import {
    createEvent,
    getEvent
} from "../controllers/event.controller.js"

router.route("/create").post(createEvent);
router.route("/").get(getEvent);
export default router;