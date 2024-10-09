import { Response, Request, NextFunction } from "express";
import { Inject, Service } from "typedi";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { ResponseStatus } from "../enums/ResponseStatus";
import UserService from "../services/user";
import HttpException from "../utils/exceptions/http.exception";

@Service()
class UserController {
  constructor(
    @Inject()
    private readonly userService: UserService,
  ) {}

  public getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const users = await this.userService.getUsers();

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

  public getUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.params.id;

      const user = await this.userService.getUser(userId);

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

  public getMe = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.userService.getMe(req);

      next();
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
