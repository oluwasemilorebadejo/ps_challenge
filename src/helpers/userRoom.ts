import HttpException from "../utils/exceptions/http.exception";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { IUser } from "../interfaces/User";
import UserRepository from "../repositories/user";
import RoomRepository from "../repositories/room";

const userRepository = new UserRepository();
const roomRepository = new RoomRepository();

export const fetchUserAndRoom = async (
  roomCode: string,
  currentUser: IUser,
) => {
  const user = await userRepository.findById(currentUser.id, ["room"]);

  if (!user) {
    throw new HttpException("User doesn't exist", HttpStatusCode.NOT_FOUND);
  }

  const room = await roomRepository.findByCode(roomCode);

  if (!room) {
    throw new HttpException("Room not found", HttpStatusCode.NOT_FOUND);
  }

  const roomBelongsToUser = user.room.some((room) => room.code === roomCode);

  if (!roomBelongsToUser) {
    throw new HttpException(
      "Cannot pay for a room you don't belong to.",
      HttpStatusCode.FORBIDDEN,
    );
  }

  return { user, room };
};
