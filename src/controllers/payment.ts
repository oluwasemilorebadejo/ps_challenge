import { Request, Response, NextFunction } from "express";
import PaymentService from "../services/payment";
import crypto from "crypto";
import config from "config";

class PaymentController {
  // Method to charge a user
  public async charge(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const code = req.params.roomCode;
    const currentUser = req.user;

    try {
      const response = await PaymentService.chargeUser(code, currentUser!);
      res.send(response);
    } catch (error) {
      next(error);
    }
  }

  // Method to handle the Paystack webhook
  public async webhook(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Validate event
      const hash = crypto
        .createHmac("sha512", config.get<string>("paystack_secret_key"))
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (hash === req.headers["x-paystack-signature"]) {
        // Retrieve the request's body
        const event = req.body;
        console.log(event);

        // Process event if it's a successful charge
        if (event.event === "charge.success") {
          await PaymentService.handleChargeSuccess(event);
        }
      }

      // Respond with HTTP 200 OK
      res.sendStatus(200);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

export default new PaymentController();
