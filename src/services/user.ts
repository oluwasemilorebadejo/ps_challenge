import { Inject, Service } from "typedi";
import { IUser } from "../interfaces/User";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import HttpException from "../utils/exceptions/http.exception";
import UserRepository from "../repositories/user";
import { Request } from "express";
@Service()
class UserService {
  constructor(
    @Inject()
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * getUsers
   */
  public async getUsers(): Promise<IUser[]> {
    return this.userRepository.findAll();
  }

  /**
   * getUser
   */
  public async getUser(id: string): Promise<IUser | null> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new HttpException("User not found", HttpStatusCode.NOT_FOUND);
    }

    return user;
  }

  /**
   * getMe
   */
  public async getMe(req: Request) {
    if (!req.user?.id) {
      throw new HttpException("User ID is missing", HttpStatusCode.NOT_FOUND);
    }

    req.params.id = req.user.id;
  }
}

export default UserService;
