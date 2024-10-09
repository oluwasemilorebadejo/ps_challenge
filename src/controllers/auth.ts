import { Request, Response, NextFunction } from "express";
import { Inject, Service } from "typedi";
import config from "config";

import { ResponseStatus } from "../enums/ResponseStatus";
import AuthService from "../services/auth";
import { CreateUserDto, LoginUserDto } from "../dtos/user.dto";

@Service()
class AuthController {
  constructor(
    @Inject()
    private readonly authService: AuthService,
  ) {}

  public login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const loginUserDto: LoginUserDto = req.body;
      const accessToken = await this.authService.login(loginUserDto);

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

  public signup = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const createUserDto: CreateUserDto = req.body;

    try {
      await this.authService.signup(createUserDto);

      res.status(201).json({
        status: ResponseStatus.SUCCESS,
        message: "User account created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public logout = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      res.clearCookie("accessToken").json({
        status: ResponseStatus.SUCCESS,
        message: "User logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
