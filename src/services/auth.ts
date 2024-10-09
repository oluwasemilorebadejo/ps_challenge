import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import config from "config";
import HttpException from "../utils/exceptions/http.exception";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { CreateUserDto, LoginUserDto } from "../dtos/user.dto";
import { Inject, Service } from "typedi";
import UserRepository from "../repositories/user";

@Service()
class AuthService {
  constructor(
    @Inject()
    private readonly userRepository: UserRepository,
  ) {}

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

  public async login(data: LoginUserDto): Promise<string> {
    const { email, password } = data;

    const user = await this.userRepository.findByEmail(email);

    if (!user || !(await this.comparePassword(password, user.password))) {
      throw new HttpException(
        "Incorrect email or password",
        HttpStatusCode.UNAUTHORIZED,
      );
    }

    const accessToken = this.createJwtToken(user.id);
    return accessToken;
  }

  public async signup(data: CreateUserDto): Promise<void> {
    const { email, password } = data;

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new HttpException(
        "User with this email already exists",
        HttpStatusCode.CONFLICT,
      );
    }

    const hashedPassword = await this.hashPassword(password);

    const newUserData = {
      ...data,
      password: hashedPassword,
    };

    await this.userRepository.create(newUserData);

    // send email functionality here
  }
}

export default AuthService;
