import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import config from "config";
import { CreateUser, ILogin } from "../interfaces/User";
import HttpException from "../utils/exceptions/http.exception";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import userRepository from "../repositories/user";

class AuthService {
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async comparePassword(
    candidatePassword: string,
    userPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(candidatePassword, userPassword);
  }

  private createJwtToken(id: string): string {
    return jwt.sign({ id: id }, config.get<string>("access_token_secret"));
  }

  public async login(data: ILogin): Promise<string> {
    const user = await userRepository.findByEmail(data.email);

    if (!user || !(await this.comparePassword(data.password, user.password))) {
      throw new HttpException(
        "Incorrect email or password",
        HttpStatusCode.UNAUTHORIZED,
      );
    }

    const accessToken = this.createJwtToken(user.id);
    return accessToken;
  }

  public async signup(data: CreateUser): Promise<void> {
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new HttpException(
        "User with this email already exists",
        HttpStatusCode.CONFLICT,
      );
    }

    const hashedPassword = await this.hashPassword(data.password);

    const newUserData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      age: data.age,
      address: data.address,
      role: data.role,
    };

    await userRepository.create(newUserData);

    // send email functionality here
  }
}

export default new AuthService();
