import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import config from "config";
import { CreateUser, ILogin } from "../interfaces/User";
import User from "../entity/User";
import HttpException from "../utils/exceptions/http.exception";
import { StatusCodes as HttpStatusCode } from "http-status-codes";

const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

const comparePassword = async (
  candidatePassword: string,
  userPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(candidatePassword, userPassword);
};

const createJwtToken = (id: string): string => {
  return jwt.sign({ id: id }, config.get<string>("access_token_secret"));
};

export const login = async (data: ILogin): Promise<string> => {
  const user = await User.findOne({
    where: { email: data.email.toLowerCase() },
  });

  if (!user || !(await comparePassword(data.password, user.password)))
    throw new HttpException(
      "Incorrect email or password",
      HttpStatusCode.UNAUTHORIZED,
    );

  const accessToken = createJwtToken(user.id);

  return accessToken;
};

export const signup = async (data: CreateUser): Promise<void> => {
  const existingUser = await User.findOne({
    where: { email: data.email.toLowerCase() },
  });

  if (existingUser)
    throw new HttpException(
      "User with this email already exists",
      HttpStatusCode.CONFLICT,
    );

  const hashedPassword = await hashPassword(data.password);

  const newUser = User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: hashedPassword,
    age: data.age,
    address: data.address,
    role: data.role,
  });

  await newUser.save();

  // send email functionality here
};
