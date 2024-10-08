import transactionRepository from "../repositories/transaction";
import Room from "../entity/Room";
import User from "../entity/User";
import { IRoom } from "../interfaces/Room";
import { IUser } from "../interfaces/User";
import { TransactionType } from "../enums/Transaction";

export const createTransaction = async (
  amount: number,
  user: IUser,
  room: IRoom,
  type: TransactionType,
) => {
  const newTransaction = await transactionRepository.create({
    amount,
    user,
    type,
    room,
  });

  return newTransaction;
};
