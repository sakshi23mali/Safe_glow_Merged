import express from "express";
import { recommendProducts } from "../controllers/productController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateSkinTypeQuery } from "../validation/products.js";

const router = express.Router();

router.get("/recommend", requireAuth, validateSkinTypeQuery, recommendProducts);

export default router;

