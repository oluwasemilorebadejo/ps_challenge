import express, { Router } from "express";
import AuthMiddleware from "../../middleware/auth";
import { UserRole } from "../../enums/User";
// import * as userController from "../../controllers/user";
import UserController from "../../controllers/user";
import { Container } from "typedi";

const router: Router = express.Router();

const userController = Container.get(UserController);

router.use(AuthMiddleware.authorize);

router.route("/me").get(userController.getMe, userController.getUser);

router.use(AuthMiddleware.restrictTo(UserRole.ADMIN));

router.route("/").get(userController.getAllUsers);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser);

export default router;
