import HttpException from "./http.exception";
import { Response } from "express";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import config from "config";
import { JsonWebTokenError } from "jsonwebtoken";
// import { ResponseStatus } from "../../enums/ResponseStatus";

class ErrorHandler {
  private isTrustedError(err: Error): boolean {
    return err instanceof HttpException || err instanceof JsonWebTokenError;
  }

  public handleError(
    err: Error | HttpException | JsonWebTokenError,
    res: Response,
  ): void {
    if (this.isTrustedError(err) && res) {
      this.handleTrustedError(err, res);
    } else {
      this.handleCriticalError(err, res);
    }
  }

  public handleTrustedError(
    err: Error | HttpException | JsonWebTokenError,
    res: Response,
  ): void {
    let statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
    let message = "An unexpected error occurred";

    if (err instanceof HttpException) {
      statusCode = err.statusCode;
      message = err.message;
    } else if (err instanceof JsonWebTokenError) {
      statusCode = HttpStatusCode.UNAUTHORIZED;
      message = err.message;
    }

    if (config.get<string>("node_env") === "development") {
      res.status(statusCode).json({
        // status: ResponseStatus.FAIL,
        message: message,
        error: err,
        stack: err.stack,
      });
    } else {
      res.status(statusCode).json({
        // status: ResponseStatus.FAIL,
        message: message,
      });
    }
  }

  public handleCriticalError(
    err: Error | HttpException | JsonWebTokenError,
    res?: Response,
  ): void {
    res?.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      // status: ResponseStatus.ERROR,
      message: "Internal Server Error. Something went wrong",
    });

    console.error(err);
    process.exit(1);
  }
}

export const errorHandler = new ErrorHandler();
