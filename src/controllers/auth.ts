import { Request, Response, NextFunction } from "express";
import { ResponseStatus } from "../enums/ResponseStatus";
// import * as authService from "../services/auth";
import AuthService from "../services/auth";
import config from "config";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;

  try {
    const accessToken = await AuthService.login({
      email,
      password,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: config.get<string>("node_env") === "production",
      sameSite: "none",
      expires: new Date(
        Date.now() +
          config.get<number>("access_token_expires") * 24 * 60 * 60 * 1000,
      ),
    });

    res.status(200).json({
      status: ResponseStatus.SUCCESS,
      message: "User logged in successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { firstName, lastName, email, age, password, address, role } = req.body;

  try {
    const newUser = await AuthService.signup({
      firstName,
      lastName,
      email,
      age,
      password,
      address,
      role,
    });

    res.status(201).json({
      status: ResponseStatus.SUCCESS,
      message: "User account created sucessfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.clearCookie("accessToken").json({
      status: ResponseStatus.SUCCESS,
      message: "User logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
