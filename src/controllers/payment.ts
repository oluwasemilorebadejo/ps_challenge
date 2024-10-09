import { Request, Response, NextFunction } from "express";
import { Inject, Service } from "typedi";
import crypto from "crypto";
import config from "config";

import PaymentService from "../services/payment";
@Service()
class PaymentController {
  constructor(
    @Inject()
    private readonly paymentService: PaymentService,
  ) {}

  public charge = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const code = req.params.roomCode;
    const currentUser = req.user;

    try {
      const response = await this.paymentService.chargeUser(code, currentUser!);
      res.send(response);
    } catch (error) {
      next(error);
    }
  };

  public webhook = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Validate event
      const hash = crypto
        .createHmac("sha512", config.get<string>("paystack_secret_key"))
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (hash === req.headers["x-paystack-signature"]) {
        // Retrieve the request's body
        const event = req.body;
        // console.log(event);

        // Process event if it's a successful charge
        if (event.event === "charge.success") {
          await this.paymentService.handleChargeSuccess(event);
        }
      }

      // Respond with HTTP 200 OK
      res.sendStatus(200);
    } catch (error) {
      console.error(error);
      next(error);
    }
  };
}

export default PaymentController;
