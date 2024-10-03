import { StatusCodes as HttpStatusCode } from "http-status-codes";

class HttpException extends Error {
  public message: string;
  public statusCode: HttpStatusCode;
  public status: string;
  public isOperational: boolean = true;

  constructor(message: string, statusCode: number) {
    super(message);

    this.message = message;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default HttpException;
