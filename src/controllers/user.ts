import { Response, Request, NextFunction } from "express";
import { ResponseStatus } from "../enums/ResponseStatus";
import UserService from "../services/user";
import HttpException from "../utils/exceptions/http.exception";
import { StatusCodes as HttpStatusCode } from "http-status-codes";

class UserController {
  // Method to get all users (admin route)
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

  // Method to get a single user by ID
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

  // Method to update a user
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

  // Method to get the current user's data (using their token)
  public async getMe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (req.user?.id) {
        req.params.id = req.user.id; // Modify the request to include the user ID
      } else {
        throw new HttpException("User ID is missing", HttpStatusCode.NOT_FOUND);
      }

      next(); // Proceed to the next middleware or controller function
    } catch (error) {
      next(error);
    }
  }

  // Method to delete a user (admin route)
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
