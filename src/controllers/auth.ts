import { Request, Response, NextFunction } from "express";
import { ResponseStatus } from "../enums/ResponseStatus";
import AuthService from "../services/auth";
import config from "config";

class AuthController {
  // Method to handle login
  public async login(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
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
  }

  // Method to handle signup
  public async signup(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { firstName, lastName, email, age, password, address, role } =
      req.body;

    try {
      await AuthService.signup({
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
        message: "User account created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Method to handle logout
  public async logout(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.clearCookie("accessToken").json({
        status: ResponseStatus.SUCCESS,
        message: "User logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
