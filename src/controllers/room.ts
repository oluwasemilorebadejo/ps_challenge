import { Request, Response, NextFunction } from "express";
// import * as roomService from "../services/room";
import RoomService from "../services/room";
import { ResponseStatus } from "../enums/ResponseStatus";

export const createRoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const currentUser = req.user;

  try {
    const { name, amountPerPerson, maxNumberOfPeople, billingDate } = req.body;

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
};

export const joinRoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
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
};

export const getAllRooms = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
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
};

export const getRoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
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
};

export const updateRoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
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
};

export const getMyRooms = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
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
};

export const leaveRoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
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
};
