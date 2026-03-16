/**
 * FOCO — Rotas da rotina (protegidas por JWT)
 */
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getRotina, putRotina } from "../controllers/rotina.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", getRotina);
router.put("/", putRotina);

export default router;
