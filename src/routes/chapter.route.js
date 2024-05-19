import { Router } from "express";
const router = Router();
import { 
    createChapter,
    getChapter,
    updateChapter,
    deleteChapter
 } from "../controllers/chapter.controller.js";
router.route("/create").post(createChapter);
router.route("/").get(getChapter);
router.route("/update/:chapterId").put(updateChapter);
router.route("/delete/:chapterId").delete(deleteChapter);

export default router;