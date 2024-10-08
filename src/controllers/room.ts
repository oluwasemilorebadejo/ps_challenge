import { Request, Response, NextFunction } from "express";
import RoomService from "../services/room";
import { ResponseStatus } from "../enums/ResponseStatus";

class RoomController {
  // Method to create a room
  public async createRoom(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const currentUser = req.user;

    try {
      const { name, amountPerPerson, maxNumberOfPeople, billingDate } =
        req.body;

      const newRoom = await RoomService.createRoom(
        {
          name,
          amountPerPerson,
          maxNumberOfPeople,
          billingDate,
        },
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
  }

  // Method to join a room
  public async joinRoom(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const roomCode = req.params.code;
    const currentUser = req.user;

    try {
      await RoomService.joinRoom(roomCode, currentUser!);
      res.status(200).json({
        status: ResponseStatus.SUCCESS,
        message: "Joined room successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Method to fetch all rooms
  public async getAllRooms(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const rooms = await RoomService.getRooms();

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
  }

  // Method to fetch a single room by code
  public async getRoom(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const roomCode = req.params.code;

      const room = await RoomService.getRoom(roomCode);

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
  }

  // Method to update a room
  public async updateRoom(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      const updatedRoom = await RoomService.updateRoom(
        id,
        req.body,
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
  }

  // Method to fetch rooms the current user belongs to
  public async getMyRooms(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const currentUser = req.user;
    try {
      const myRooms = await RoomService.getMyRooms(currentUser!);

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
  }

  // Method to leave a room
  public async leaveRoom(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const roomCode = req.params.code;
    const currentUser = req.user;

    try {
      await RoomService.leaveRoom(roomCode, currentUser!);

      res.status(200).json({
        status: ResponseStatus.SUCCESS,
        message: "You have left the room successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new RoomController();
