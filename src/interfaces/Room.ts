import { IUser } from "./User";

export interface IRoom {
  id: string;
  code: string;
  name: string;
  amountPerPerson: number;
  numberOfPeople: number;
  maxNumberOfPeople: number;
  billingDate: number;
  joinedAt: Date;
  owner: IUser;
}

// export interface CreateRoom {
//   id?: string;
//   code?: string;
//   name: string;
//   amountPerPerson: number;
//   numberOfPeople?: number;
//   maxNumberOfPeople: number;
//   billingDate: number;
//   joinedAt?: Date;
//   owner?: IUser;
// }
