import express, { Router } from "express";
// import * as roomController from "../../controllers/room";
import AuthMiddleware from "../../middleware/auth";
import { UserRole } from "../../enums/User";
import RoomController from "../../controllers/room";

const router: Router = express.Router();

// I THINK ANYONE CAN VIEW  ROOM INFOMATION. THIS IS NEEDED SO USERS CAN SEE THE DETAILS OF THE ROOM BEFORE JOINING
router.route("/:code").get(RoomController.getRoom);

router.use(AuthMiddleware.authorize);

router.get("/user/me", RoomController.getMyRooms); // come back to rename

router.post("/join/:code", RoomController.joinRoom);

router.post("/leave/:code", RoomController.leaveRoom);

router.use(AuthMiddleware.restrictTo(UserRole.COLLECTOR, UserRole.ADMIN));

router.route("/:id").patch(RoomController.updateRoom);

router.route("/").post(RoomController.createRoom);

router.use(AuthMiddleware.restrictTo(UserRole.ADMIN));

router.get("/", RoomController.getAllRooms);

export default router;
