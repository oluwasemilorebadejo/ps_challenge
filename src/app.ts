import express, { Application, Request, Response, NextFunction } from "express";

import authRouter from "./routes/v1/auth";
import userRouter from "./routes/v1/user";
import roomRouter from "./routes/v1/room";
import paymentRouter from "./routes/v1/payment";
import HttpException from "./utils/exceptions/http.exception";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import errorMiddleware from "./middleware/error";
import config from "config";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import Transaction from "./entity/Transaction";
import { TransactionStatus } from "./enums/Transaction";
import PaystackAuthorization from "./entity/PaystackAuthorization";

const crypto = require("crypto");
const secret = process.env.PAYSTACK_SECRET_KEY;

const app: Application = express();

app.use(express.json({ limit: "10kb" }));

if (config.get<string>("node_env") === "development") {
  app.use(morgan("dev"));
}

app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/rooms", roomRouter);
app.use("/api/v1/payment", paymentRouter);

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: "success",
    message: `welcome from ${req.ip}`,
    data: {},
  });
});

app.post("/webhook", async (req, res) => {
  //validate event
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");
  if (hash == req.headers["x-paystack-signature"]) {
    // Retrieve the request's body
    const event = req.body;
    // console.log(event);
    // Do something with event
    if (event.event === "charge.success") {
      // 1. update transaction status to success and store the entire authorization

      const updatedTransaction = await Transaction.findOne({
        where: { id: event.data.reference },
      });

      if (!updatedTransaction) {
        throw new HttpException(
          "Transaction not found",
          HttpStatusCode.NOT_FOUND,
        );
      }

      updatedTransaction.status = TransactionStatus.SUCCESS;

      await updatedTransaction.save();

      const authorization = event.data.authorization;

      const newPaystackAuthorization = PaystackAuthorization.create({
        authorizationCode: authorization.authorization_code,
        bank: authorization.bank,
        bin: authorization.bin,
        cardType: authorization.card_type,
        channel: authorization.channel,
        countryCode: authorization.country_code,
        expMonth: authorization.exp_month,
        expYear: authorization.exp_year,
        last4: authorization.last4,
        reusable: authorization.reusable,
        signature: authorization.signature,
        transaction: updatedTransaction,
      });

      await newPaystackAuthorization.save();
      /*-------------
      -----*/

      // 2. dont store authorization when transaction fails
    }
  }
  res.send(200);
  // res.sendStatus(200);
});

app.use("*", async (req: Request, res: Response, next: NextFunction) => {
  next(
    new HttpException(
      `cant find ${req.method} at ${req.originalUrl}`,
      HttpStatusCode.NOT_FOUND,
    ),
  );
});

app.use(errorMiddleware);

export default app;
