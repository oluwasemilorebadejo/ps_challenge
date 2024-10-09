import express, { Router } from "express";
// import * as authController from "../../controllers/auth";
import { Container } from "typedi";
import AuthController from "../../controllers/auth";
import { validateDto } from "../../middleware/validator";
import { CreateUserDto, LoginUserDto } from "../../dtos/user.dto";

const router: Router = express.Router();

const authController = Container.get(AuthController);

router.post("/login", validateDto(LoginUserDto), authController.login);
router.post("/signup", validateDto(CreateUserDto), authController.signup);
router.post("/logout", authController.logout);

export default router;
