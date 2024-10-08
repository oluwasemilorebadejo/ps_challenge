import { IUser } from "../interfaces/User";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import HttpException from "../utils/exceptions/http.exception";
import userRepository from "../repositories/user";

class UserService {
  /**
   * getUsers
   */
  public async getUsers(): Promise<IUser[]> {
    return userRepository.findAll();
  }

  /**
   * getUser
   */
  public async getUser(id: string): Promise<IUser | null> {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new HttpException("User not found", HttpStatusCode.NOT_FOUND);
    }

    return user;
  }
}

export default new UserService();
