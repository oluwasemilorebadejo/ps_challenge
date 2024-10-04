import express, { Router } from "express";
import * as authController from "../../controllers/auth";

const router: Router = express.Router();

router.use("/login", authController.login);
router.use("/signup", authController.signup);
router.use("/logout", authController.logout);

export default router;
