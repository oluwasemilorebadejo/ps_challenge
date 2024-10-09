import express, { Application, Request, Response, NextFunction } from "express";
import config from "config";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { Container } from "typedi";

import authRouter from "./routes/v1/auth";
import userRouter from "./routes/v1/user";
import roomRouter from "./routes/v1/room";
import paymentRouter from "./routes/v1/payment";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import HttpException from "./utils/exceptions/http.exception";
import errorMiddleware from "./middleware/error";

import PaymentController from "./controllers/payment";
import initializeCronJobs from "./cron";

const paymentController = Container.get(PaymentController);

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

app.post("/webhook", paymentController.webhook);

initializeCronJobs();

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
