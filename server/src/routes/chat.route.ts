import { Router } from "express";
import { create } from "src/controller/chat.controller";

const router = Router();

router.post("/", create);

export default router;
