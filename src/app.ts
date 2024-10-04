import express, { Application, Request, Response, NextFunction } from "express";

import authRouter from "./routes/v1/auth";
import userRouter from "./routes/v1/user";
import roomRouter from "./routes/v1/room";
import HttpException from "./utils/exceptions/http.exception";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import errorMiddleware from "./middleware/error";
import config from "config";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(express.json({ limit: "10kb" }));

if (config.get<string>("node_env") === "development") {
  app.use(morgan("dev"));
}

app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/rooms", roomRouter);

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
