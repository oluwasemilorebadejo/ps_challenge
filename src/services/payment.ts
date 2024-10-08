import axios, { AxiosResponse } from "axios";
import config from "config";
import HttpException from "../utils/exceptions/http.exception";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import User from "../entity/User";
import Room from "../entity/Room";
import { IUser } from "../interfaces/User";
import { TransactionStatus, TransactionType } from "../enums/Transaction";
import PaystackAuthorization from "../entity/PaystackAuthorization";
import { IPaystackAuthorization } from "../interfaces/PaystackAuthorization";
import userRepository from "../repositories/user";
import roomRepository from "../repositories/room";
import transactionRepository from "../repositories/transaction";
import paystackAuthorizationRepository from "../repositories/paystackAuthorization";

export const chargeUser = async (
  roomCode: string,
  currentUser: IUser,
): Promise<AxiosResponse> => {
  const user = await userRepository.findById(currentUser.id, ["room"]);

  if (!user) {
    throw new HttpException("User doesnt exist", HttpStatusCode.NOT_FOUND);
  }

  const room = await roomRepository.findByCode(roomCode);

  if (!room) {
    throw new HttpException("Room not found", HttpStatusCode.NOT_FOUND);
  }

  // Check if the user is part of the room
  const roomBelongsToUser = user.room.some((room) => room.code === roomCode);

  if (!roomBelongsToUser) {
    throw new HttpException(
      "Cannot pay for a room you don't belong to.",
      HttpStatusCode.FORBIDDEN,
    );
  }

  const newTransaction = await transactionRepository.create({
    amount: room.amountPerPerson,
    user: user,
    type: TransactionType.INITIAL,
    room: room,
  });

  const params = {
    email: user.email,
    amount: room.amountPerPerson * 100, // ;)
    channels: ["card"],
    reference: newTransaction.id,
  };

  const options = {
    headers: {
      Authorization: `Bearer ${config.get<string>("paystack_secret_key")}`,
      "Content-Type": "application/json",
    },
  };

  // try {
  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    params,
    options,
  );

  return response.data;
};

export const handleChargeSuccess = async (event: any): Promise<void> => {
  // 1. update transaction status to success and store the entire authorization
  const updatedTransaction = await transactionRepository.findById(
    event.data.reference,
  );

  if (!updatedTransaction) {
    throw new HttpException("Transaction not found", HttpStatusCode.NOT_FOUND);
  }

  updatedTransaction.status = TransactionStatus.SUCCESS;

  await transactionRepository.save(updatedTransaction);

  const user = await userRepository.findByEmail(event.data.customer.email);

  if (!user) {
    throw new HttpException("User not found", HttpStatusCode.NOT_FOUND);
  }

  const authorization = event.data.authorization;

  // if authorization exists return
  const existingAuthorization =
    await paystackAuthorizationRepository.findBySignature(
      authorization.signature,
    );

  if (existingAuthorization) return;

  const newPaystackAuthorization = paystackAuthorizationRepository.create({
    authorizationCode: authorization.authorization_code,
    bank: authorization.bank,
    bin: authorization.bin,
    cardType: authorization.card_type,
    channel: authorization.channel,
    countryCode: authorization.country_code,
    expMonth: authorization.exp_month,
    expYear: authorization.exp_year,
    last4: authorization.last4,
    reusable: authorization.reusable,
    signature: authorization.signature,
    transaction: updatedTransaction,
    user: user,
  });
};

const chargeUserJob = async (
  roomCode: string,
  currentUser: IUser,
  authorization: IPaystackAuthorization,
) => {
  const user = await userRepository.findById(currentUser.id, ["room"]);

  if (!user) {
    throw new HttpException("User doesnt exist", HttpStatusCode.NOT_FOUND);
  }

  const room = await roomRepository.findByCode(roomCode);

  if (!room) {
    throw new HttpException("Room not found", HttpStatusCode.NOT_FOUND);
  }

  const auth = await PaystackAuthorization.findOne({
    where: { id: authorization.id },
  });

  if (!auth) {
    throw new HttpException(
      "Authorizatipn not found",
      HttpStatusCode.NOT_FOUND,
    );
  }

  // Check if the user is part of the room
  const roomBelongsToUser = user.room.some((room) => room.code === roomCode);

  if (!roomBelongsToUser) {
    throw new HttpException(
      "Cannot pay for a room you don't belong to.",
      HttpStatusCode.FORBIDDEN,
    );
  }

  const newTransaction = await transactionRepository.create({
    amount: room.amountPerPerson,
    user: user,
    type: TransactionType.RECURRING,
    room: room,
  });

  const params = {
    email: user.email,
    amount: room.amountPerPerson * 100, // ;)
    channels: ["card"],
    reference: newTransaction.id,
    authorization_code: authorization.authorizationCode,
  };

  const options = {
    headers: {
      Authorization: `Bearer ${config.get<string>("paystack_secret_key")}`,
      "Content-Type": "application/json",
    },
  };

  // try {
  const response = await axios.post(
    "https://api.paystack.co/transaction/charge_authorization",
    params,
    options,
  );

  return response.data;
};

export const runDailyBilling = async (): Promise<void> => {
  const today = new Date().getDate();

  // const roomsToBill = await Room.find({
  //   where: { billingDate: today },
  //   relations: {
  //     owner: true,
  //   },
  // });

  const roomsToBill = await roomRepository.findByBillingDate(today, ["owner"]);

  // console.log(roomsToBill, "--rooms to bill--");

  for (const room of roomsToBill) {
    // Fetch all contributors (users) of the room
    const contributors = await User.find({
      relations: {
        room: true,
      },
      where: { room: { id: room.id } },
    });

    // console.log(contributors, "--contributors--");

    for (const contributor of contributors) {
      // console.log(contributor, "-contributor--");
      // Fetch the Paystack Authorization for the current user
      // const authorization = await PaystackAuthorization.findOne({
      //   where: { user: { id: contributor.id } },
      // });

      const authorization = await paystackAuthorizationRepository.findByUserId(
        contributor.id,
      );

      if (!authorization) {
        console.warn(
          `Authorization not found for user ${contributor.email} in room ${room.code}`,
        );
        continue; // Skip the user if no authorization is found
      }

      await chargeUserJob(room.code, contributor, authorization);
    }
  }
};
