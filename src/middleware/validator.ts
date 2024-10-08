import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import HttpException from "../utils/exceptions/http.exception";

export const validateDto = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoObject = plainToClass(dtoClass, req.body); // Convert request body to DTO class instance
    const errors: ValidationError[] = await validate(dtoObject);

    if (errors.length > 0) {
      const message = errors
        .map((error) => Object.values(error.constraints!))
        .join(", ");
      return next(new HttpException(message, HttpStatusCode.BAD_REQUEST));
    }

    req.body = dtoObject; // Optional: Assign the transformed DTO back to the request body
    next();
  };
};
