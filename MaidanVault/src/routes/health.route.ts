import { Router } from "express";
import type { Router as RouterType } from "express-serve-static-core";
import { healthCheck } from "../controllers/health.controller";

const router: RouterType = Router();

router.get("/health", healthCheck);

export default router;
