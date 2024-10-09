import express, { Router } from "express";
// import * as roomController from "../../controllers/room";
import AuthMiddleware from "../../middleware/auth";
import { UserRole } from "../../enums/User";
import RoomController from "../../controllers/room";
import { validateDto } from "../../middleware/validator";
import { CreateRoomDto, UpdateRoomDto } from "../../dtos/room.dto";
import { Container } from "typedi";

const router: Router = express.Router();

const roomController = Container.get(RoomController);

// I THINK ANYONE CAN VIEW  ROOM INFOMATION. THIS IS NEEDED SO USERS CAN SEE THE DETAILS OF THE ROOM BEFORE JOINING
router.route("/:code").get(roomController.getRoom);

router.use(AuthMiddleware.authorize);

router.get("/user/me", roomController.getMyRooms); // come back to rename

router.post("/join/:code", roomController.joinRoom);

router.post("/leave/:code", roomController.leaveRoom);

router.use(AuthMiddleware.restrictTo(UserRole.COLLECTOR, UserRole.ADMIN));

router
  .route("/:id")
  .patch(validateDto(UpdateRoomDto), roomController.updateRoom);

router.route("/").post(validateDto(CreateRoomDto), roomController.createRoom);

router.use(AuthMiddleware.restrictTo(UserRole.ADMIN));

router.get("/", roomController.getAllRooms);

export default router;
