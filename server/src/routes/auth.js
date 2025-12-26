import express from "express";
import { exists, login, register, verifyEmail } from "../controllers/authController.js";
import {
    validateExistsQuery,
    validateLoginBody,
    validateRegisterBody,
} from "../validation/auth.js";

const router = express.Router();

router.get("/exists", validateExistsQuery, exists);
router.get("/verify-email", verifyEmail);
router.post("/register", validateRegisterBody, register);
router.post("/login", validateLoginBody, login);

export default router;
