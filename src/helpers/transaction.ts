import TransactionRepository from "../repositories/transaction";
import { IRoom } from "../interfaces/Room";
import { IUser } from "../interfaces/User";
import { TransactionType } from "../enums/Transaction";

const transactionRepository = new TransactionRepository();

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
