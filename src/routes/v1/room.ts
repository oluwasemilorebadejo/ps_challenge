import express, { Router } from "express";
import * as roomController from "../../controllers/room";
import * as authMiddleware from "../../middleware/auth";
import { UserRole } from "../../enums/User";

const router: Router = express.Router();

// I THINK ANYONE CAN VIEW  ROOM INFOMATION. THIS IS NEEDED SO USERS CAN SEE THE DETAILS OF THE ROOM BEFORE JOINING
router.route("/:code").get(roomController.getRoom);

router.use(authMiddleware.authorize);

router.get("/user/me", roomController.getMyRooms); // come back to rename

router.post("/join/:code", roomController.joinRoom);

router.use(authMiddleware.restrictTo(UserRole.COLLECTOR, UserRole.ADMIN));

router.route("/:id").patch(roomController.updateRoom);

router.route("/").post(roomController.createRoom);

router.use(authMiddleware.restrictTo(UserRole.ADMIN));

router.get("/", roomController.getAllRooms);

export default router;
