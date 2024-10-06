import express, { Router } from "express";
import * as authController from "../../controllers/auth";

const router: Router = express.Router();

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/logout", authController.logout);

export default router;
