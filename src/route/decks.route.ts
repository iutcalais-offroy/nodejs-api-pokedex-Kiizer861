import { Router } from "express";
import { authController } from "../controller/decks.controller";
import { authMiddleware } from "../middleware/decks.middleware";

const router = Router();


router.post("/sign-up", authController.signUp);
router.post("/sign-in", authController.signIn);
router.get("/cards", authController.getAllCards);

router.get("/profile", authMiddleware, authController.getProfile);

export default router;
