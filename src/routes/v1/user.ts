import express, { Router } from "express";
import { authorize, restrictTo } from "../../middleware/auth";
import { UserRole } from "../../enums/User";
import * as userController from "../../controllers/user";

const router: Router = express.Router();

router.use(authorize);

router.route("/me").get(userController.getMe, userController.getUser);

router.use(restrictTo(UserRole.ADMIN));

router.route("/").get(userController.getAllUsers);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser);

export default router;
