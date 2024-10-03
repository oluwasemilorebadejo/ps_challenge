import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../utils/exceptions/exception.handler";

const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  errorHandler.handleError(err, res);
  next();
};

export default errorMiddleware;
