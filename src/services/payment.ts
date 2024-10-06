import axios from "axios";
import config from "config";
import HttpException from "../utils/exceptions/http.exception";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import User from "../entity/User";
import Room from "../entity/Room";
import { IUser } from "../interfaces/User";
import Transaction from "../entity/Transaction";

export const chargeUser = async (
  roomCode: string,
  currentUser: IUser | undefined,
) => {
  const user = await User.findOne({
    where: {
      id: currentUser?.id,
    },
    relations: {
      room: true,
    },
  });

  // console.log(currentUser);

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
