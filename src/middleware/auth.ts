import { Request, Response, NextFunction } from "express";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import HttpException from "../utils/exceptions/http.exception";
import * as jwt from "jsonwebtoken";
import config from "config";
import User from "../entity/User";
import { UserRole } from "../enums/User";

export const authorize = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.cookies.accessToken;

  try {
    if (!accessToken) {
      throw new HttpException("Kindly sign in", HttpStatusCode.UNAUTHORIZED);
    }

    const decodedUser = jwt.verify(
      accessToken,
      config.get<string>("access_token_secret"),
    ) as jwt.JwtPayload;

    const user = await User.findOne({ where: { id: decodedUser.id } });

    if (!user) {
      throw new HttpException(
        "User not found. Kindly signup or login",
        HttpStatusCode.NOT_FOUND,
      );
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export const restrictTo =
  (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!roles.includes(req.user!.role)) {
        throw new HttpException(
          "Access denied. you are not allowed to perform this operation",
          HttpStatusCode.FORBIDDEN,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
