import { Request, Response, NextFunction } from "express";
import { ResponseStatus } from "../enums/ResponseStatus";
import AuthService from "../services/auth";
import config from "config";
import { CreateUserDto, LoginUserDto } from "../dtos/user.dto";

class AuthController {
  public async login(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const loginUserDto: LoginUserDto = req.body;
      const accessToken = await AuthService.login(loginUserDto);

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

  public async signup(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const createUserDto: CreateUserDto = req.body;

    try {
      await AuthService.signup(createUserDto);

      res.status(201).json({
        status: ResponseStatus.SUCCESS,
        message: "User account created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

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
