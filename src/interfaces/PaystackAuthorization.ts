import { ITransaction } from "./Transaction";
import { IUser } from "./User";

export interface IPaystackAuthorization {
  id: string;
  authorizationCode: string;
  cardType: string;
  last4: number;
  expMonth: string;
  expYear: string;
  bin: number;
  bank: string;
  channel: string;
  signature: string;
  reusable: boolean;
  countryCode: string;
  createdAt: Date;
  transaction: ITransaction;
  user: IUser;
}
