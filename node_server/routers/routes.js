import { Router } from "express";
import { signUp } from "../controllers/signUp.controller.js";
import { signIn } from "../controllers/signIn.controller.js";
import authMiddleware from "../middlewares/auth.js";
import { userProfile } from "../controllers/profile.controller.js";
import { getUsers } from "../controllers/users.controller.js";

const router = Router();


router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/userProfile", authMiddleware, userProfile);
router.get('/users', authMiddleware, getUsers);

export default router;