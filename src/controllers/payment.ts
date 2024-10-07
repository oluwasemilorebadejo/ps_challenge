import express, { Request, Response, NextFunction } from "express";
import * as paymentService from "../services/payment";

import crypto from "crypto";
import config from "config";

export const charge = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const code = req.params.roomCode;
  const currentUser = req.user;

  try {
    const response = await paymentService.chargeUser(code, currentUser!);

    res.send(response);
  } catch (error) {
    next(error);
  }
};

export const webhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    //validate event
    const hash = crypto
      .createHmac("sha512", config.get<string>("paystack_secret_key"))
      .update(JSON.stringify(req.body))
      .digest("hex");
    if (hash == req.headers["x-paystack-signature"]) {
      // Retrieve the request's body
      const event = req.body;
      console.log(event);
      // Do something with event
      if (event.event === "charge.success") {
        await paymentService.handleChargeSuccess(event);
      }
    }

    // 2. dont store authorization when transaction fails
    res.send(200);
    // res.sendStatus(200);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
