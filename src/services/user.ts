import { IUser } from "../interfaces/User";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import HttpException from "../utils/exceptions/http.exception";
import userRepository from "../repositories/user";

export const getUsers = async (): Promise<IUser[]> => {
  return userRepository.findAll();
};

export const getUser = async (id: string): Promise<IUser | null> => {
  const user = await userRepository.findById(id);

  if (!user) {
    throw new HttpException("User not found", HttpStatusCode.NOT_FOUND);
  }

  return user;
};
