import { Response, Request, NextFunction } from "express";
import { ResponseStatus } from "../enums/ResponseStatus";
import * as userService from "../services/user";
import { IUser } from "../interfaces/User";
import HttpException from "../utils/exceptions/http.exception";
import { StatusCodes as HttpStatusCode } from "http-status-codes";

// admin route
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users: IUser[] = await userService.getUsers();

    res.status(200).json({
      status: ResponseStatus.SUCCESS,
      message: "List of users",
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.id;

    const user = await userService.getUser(userId);

    res.status(200).json({
      status: ResponseStatus.SUCCESS,
      message: "User data fetched successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
  } catch (error) {}
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.user?.id) {
      req.params.id = req.user.id;
    } else {
      throw new HttpException("User ID is missing", HttpStatusCode.NOT_FOUND);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// admin route
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
  } catch (error) {}
};
