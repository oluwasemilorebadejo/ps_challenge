import { Request, Response, NextFunction } from "express";
import * as roomService from "../services/room";
import { ResponseStatus } from "../enums/ResponseStatus";
import { IRoom } from "../interfaces/Room";

export const createRoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const currentUser = req.user;
  try {
    const { name, amountPerPerson, maxNumberOfPeople } = req.body;

    const newRoom = await roomService.createRoom(
      {
        name,
        amountPerPerson,
        maxNumberOfPeople,
      },
      currentUser,
    );

    res.status(201).json({
      status: ResponseStatus.SUCCESS,
      message: "New room created successfully",
      data: {
        newRoom,
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
    await roomService.joinRoom(roomCode, currentUser);
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
    const rooms = await roomService.getRooms();

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

    const room = await roomService.getRoom(roomCode);

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

    const updatedRoom = await roomService.updateRoom(id, req.body, currentUser);

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

// export const joinRoom = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ): Promise<void> => {
//   try {
//   } catch (error) {
//     next(error);
//   }
// };
