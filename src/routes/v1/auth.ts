import express, { Router } from "express";
// import * as authController from "../../controllers/auth";
import AuthController from "../../controllers/auth";
import { validateDto } from "../../middleware/validator";
import { CreateUserDto, LoginUserDto } from "../../dtos/user.dto";

const router: Router = express.Router();

router.post("/login", validateDto(LoginUserDto), AuthController.login);
router.post("/signup", validateDto(CreateUserDto), AuthController.signup);
router.post("/logout", AuthController.logout);

export default router;
