import { TransactionStatus, TransactionType } from "../enums/Transaction";
import { IRoom } from "./Room";
import { IUser } from "./User";

export interface ITransaction {
  id: string;
  status: TransactionStatus;
  amount: number;
  type: TransactionType;
  createdAt: Date;
  user: IUser;
  room: IRoom;
}
