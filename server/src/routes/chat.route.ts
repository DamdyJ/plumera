import { Router } from "express";
import { create } from "src/controller/chat.controller";

const router = Router();

// router.get("/", index);
router.post("/", create);

export default router;
