import express, { Router } from "express";
// import * as authController from "../../controllers/auth";
import AuthController from "../../controllers/auth";

const router: Router = express.Router();

router.post("/login", AuthController.login);
router.post("/signup", AuthController.signup);
router.post("/logout", AuthController.logout);

export default router;
