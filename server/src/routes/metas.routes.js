/**
 * FOCO — Rotas das metas (protegidas por JWT).
 */
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getMetas, putMetas } from "../controllers/metas.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", getMetas);
router.put("/", putMetas);

export default router;

