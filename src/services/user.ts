import User from "../entity/User";
import { IUser } from "../interfaces/User";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import HttpException from "../utils/exceptions/http.exception";

export const getUsers = async (): Promise<IUser[]> => {
  return User.find({
    // relations: {
    //   room: true,
    // },
  });
};

export const getUser = async (id: string): Promise<IUser | null> => {
  const user = await User.findOne({
    where: {
      id: id,
    },
  });

  if (!user) {
    throw new HttpException("User not found", HttpStatusCode.NOT_FOUND);
  }

  return user;
};
