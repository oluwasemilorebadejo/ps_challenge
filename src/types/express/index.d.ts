import { IUser } from "../../interfaces/User";

declare global {
  namespace Express {
    export interface Request {
      user?: IUser;
    }
  }
}
