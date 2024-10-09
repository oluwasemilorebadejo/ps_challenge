import { Request, Response, NextFunction } from "express";
import { Inject, Service } from "typedi";

import RoomService from "../services/room";
import { ResponseStatus } from "../enums/ResponseStatus";
import { CreateRoomDto, UpdateRoomDto } from "../dtos/room.dto";

@Service()
class RoomController {
  constructor(
    @Inject()
    private readonly roomService: RoomService,
  ) {}

  public createRoom = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const currentUser = req.user;
    const createRoomDto: CreateRoomDto = req.body;

    try {
      const newRoom = await this.roomService.createRoom(
        createRoomDto,
        currentUser!,
      );

      res.status(201).json({
        status: ResponseStatus.SUCCESS,
        message: "New room created successfully",
        data: {
          newRoom: {
            code: newRoom.code,
            name: newRoom.name, // CHANGE THE RETURN VALUES LATER
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public joinRoom = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const roomCode = req.params.code;
    const currentUser = req.user;

    try {
      await this.roomService.joinRoom(roomCode, currentUser!);
      res.status(200).json({
        status: ResponseStatus.SUCCESS,
        message: "Joined room successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public getAllRooms = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const rooms = await this.roomService.getRooms();

      res.status(200).json({
        status: ResponseStatus.SUCCESS,
        message: "Rooms fetched successfully",
        data: {
          rooms,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public getRoom = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const roomCode = req.params.code;

      const room = await this.roomService.getRoom(roomCode);

      res.status(200).json({
        status: ResponseStatus.SUCCESS,
        message: "Room returned successfully",
        data: {
          room,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateRoom = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const updateRoomDto: UpdateRoomDto = req.body;

    try {
      const { id } = req.params;
      const currentUser = req.user;

      const updatedRoom = await this.roomService.updateRoom(
        id,
        updateRoomDto,
        currentUser!,
      );

      res.status(200).json({
        status: ResponseStatus.SUCCESS,
        message: "Room updated successfully",
        data: {
          updatedRoom,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public getMyRooms = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const currentUser = req.user;
    try {
      const myRooms = await this.roomService.getMyRooms(currentUser!);

      res.status(200).json({
        status: ResponseStatus.SUCCESS,
        message: "List of the rooms you belong to",
        data: {
          myRooms,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public leaveRoom = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const roomCode = req.params.code;
    const currentUser = req.user;

    try {
      await this.roomService.leaveRoom(roomCode, currentUser!);

      res.status(200).json({
        status: ResponseStatus.SUCCESS,
        message: "You have left the room successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default RoomController;
