import { UserRole } from "../enums/User";
import { IRoom } from "./Room";

export interface ILogin {
  email: string;
  password: string;
}
export interface CreateUser {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
  address: string;
  role: UserRole;
}

export interface IUser {
  id?: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  // mobile: string;
  password: string;
  address: string;
  verified: boolean;
  role: UserRole;
  active: boolean;
  room: IRoom[];
}
