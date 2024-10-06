import express, {
  Application,
  Request,
  Response,
  NextFunction,
  Express,
} from "express";
import * as paymentService from "../services/payment";

export const charge = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const code = req.params.roomCode;
  const currentUser = req.user;

  try {
    const response = await paymentService.chargeUser(code, currentUser);

    res.send(response);
  } catch (error) {
    next(error);
  }
};
