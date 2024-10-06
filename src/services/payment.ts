import axios, { AxiosResponse } from "axios";
import config from "config";
import HttpException from "../utils/exceptions/http.exception";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import User from "../entity/User";
import Room from "../entity/Room";
import { IUser } from "../interfaces/User";
import Transaction from "../entity/Transaction";
import { TransactionStatus, TransactionType } from "../enums/Transaction";
import PaystackAuthorization from "../entity/PaystackAuthorization";
import { IPaystackAuthorization } from "../interfaces/PaystackAuthorization";

export const chargeUser = async (
  roomCode: string,
  currentUser: IUser | undefined,
): Promise<AxiosResponse> => {
  const user = await User.findOne({
    where: {
      id: currentUser?.id,
    },
    relations: {
      room: true,
    },
  });

  if (!user) {
    throw new HttpException("User doesnt exist", HttpStatusCode.NOT_FOUND);
  }

  const room = await Room.findOne({ where: { code: roomCode } });

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
  const newTransaction = await Transaction.create({
    amount: room.amountPerPerson,
    user: user,
    type: TransactionType.INITIAL,
  });

  await newTransaction.save();

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
  // } catch (error) {
  //   console.error(error, "----------ERR0R----------");
  // }
};

export const handleChargeSuccess = async (event: any): Promise<void> => {
  // 1. update transaction status to success and store the entire authorization
  const updatedTransaction = await Transaction.findOne({
    where: { id: event.data.reference },
  });

  if (!updatedTransaction) {
    throw new HttpException("Transaction not found", HttpStatusCode.NOT_FOUND);
  }

  updatedTransaction.status = TransactionStatus.SUCCESS;

  await updatedTransaction.save();

  const user = await User.findOne({
    where: {
      email: event.data.customer.email,
    },
  });

  if (!user) {
    throw new HttpException("User not found", HttpStatusCode.NOT_FOUND);
  }

  const authorization = event.data.authorization;

  // if authorization exists return
  const existingAuthorization = await PaystackAuthorization.findOne({
    where: { authorizationCode: authorization.authorization_code },
  });

  if (existingAuthorization) return;

  const newPaystackAuthorization = PaystackAuthorization.create({
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

  await newPaystackAuthorization.save();
};

const chargeUserJob = async (
  roomCode: string,
  currentUser: IUser,
  authorization: IPaystackAuthorization,
) => {
  const user = await User.findOne({
    where: {
      id: currentUser?.id,
    },
    relations: {
      room: true,
    },
  });

  if (!user) {
    throw new HttpException("User doesnt exist", HttpStatusCode.NOT_FOUND);
  }

  const room = await Room.findOne({ where: { code: roomCode } });

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

  const newTransaction = await Transaction.create({
    amount: room.amountPerPerson,
    user: user,
    type: TransactionType.RECURRING,
  });
  await newTransaction.save();

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

  // Find all rooms where today is the billingDate
  const roomsToBill = await Room.find({
    where: { billingDate: today },
    relations: {
      owner: true,
    }, // Ensure you fetch the owner details
  });

  // console.log(roomsToBill, "--rooms to bill--");

  for (const room of roomsToBill) {
    // Fetch all contributors (users) of the room
    const contributors = await User.find({
      where: { room: { id: room.id } },
      relations: {
        room: true,
      },
    });

    // console.log(contributors, "--contributors--");

    for (const contributor of contributors) {
      // console.log(contributor, "-contributor--");
      // Fetch the Paystack Authorization for the current user
      const authorization = await PaystackAuthorization.findOne({
        where: { user: { id: contributor.id } },
      });

      if (!authorization) {
        console.warn(
          `Authorization not found for user ${contributor.email} in room ${room.code}`,
        );
        continue; // Skip the user if no authorization is found
      }

      console.log(authorization, "---authorization---");

      // Call the chargeUserJob function with roomCode, currentUser, and authorization
      await chargeUserJob(room.code, contributor, authorization);
    }
  }
};
