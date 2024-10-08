import express, { Router } from "express";
import AuthMiddleware from "../../middleware/auth";
import { UserRole } from "../../enums/User";
// import * as userController from "../../controllers/user";
import UserController from "../../controllers/user";

const router: Router = express.Router();

router.use(AuthMiddleware.authorize);

router.route("/me").get(UserController.getMe, UserController.getUser);

router.use(AuthMiddleware.restrictTo(UserRole.ADMIN));

router.route("/").get(UserController.getAllUsers);

router
  .route("/:id")
  .get(UserController.getUser)
  .patch(UserController.updateUser);

export default router;
