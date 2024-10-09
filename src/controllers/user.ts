import { Response, Request, NextFunction } from "express";
import { ResponseStatus } from "../enums/ResponseStatus";
import UserService from "../services/user";
import HttpException from "../utils/exceptions/http.exception";
import { StatusCodes as HttpStatusCode } from "http-status-codes";

class UserController {
  public async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const users = await UserService.getUsers();

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
  }

  public async getUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.params.id;

      const user = await UserService.getUser(userId);

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
  }

  public async updateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
    } catch (error) {
      next(error);
    }
  }

  public async getMe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
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
  }

  public async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
