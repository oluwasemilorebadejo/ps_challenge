import Room from "../entity/Room";
import User from "../entity/User";
import { IRoom } from "../interfaces/Room";
import { IUser } from "../interfaces/User";
import HttpException from "../utils/exceptions/http.exception";
import { StatusCodes as HttpStatusCode } from "http-status-codes";

function generateRoomCode(): string {
  let code = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = 0; i < 6; i++) {
    // Generate a random index between 0 and 25
    const randomIndex = Math.floor(Math.random() * characters.length);

    code += characters[randomIndex];
  }

  return code;
}

export const createRoom = async (
  data: IRoom,
  owner: IUser | undefined,
): Promise<IRoom> => {
  const newRoom = Room.create({
    code: generateRoomCode(),
    name: data.name,
    amountPerPerson: data.amountPerPerson,
    maxNumberOfPeople: data.maxNumberOfPeople,
    billingDate: data.billingDate,
    joinedAt: new Date(),
    owner,
  });

  await newRoom.save();

  return newRoom;
};

export const joinRoom = async (
  code: string,
  currentUser: IUser | undefined,
) => {
  const room = await Room.findOne({ where: { code: code } });

  if (!room) {
    throw new HttpException("Room not found", HttpStatusCode.NOT_FOUND);
  }

  const user = await User.findOne({
    where: { id: currentUser?.id },
    relations: {
      room: true,
    },
  });

  if (!user) {
    throw new HttpException("User doesn't exist", HttpStatusCode.NOT_FOUND);
  }

  if (room.numberOfPeople >= room.maxNumberOfPeople) {
    throw new HttpException("Room is filled up", HttpStatusCode.BAD_REQUEST);
  }

  if (user.room.some((r) => r.id === room.id)) {
    throw new HttpException(
      "User is already in this room",
      HttpStatusCode.BAD_REQUEST,
    );
  }

  user.room = [...user.room, room];

  await user.save();

  // THIS OPERATION CAN BE STOPPED IF USER SAVE FAILS

  // Increment the number of people in the room
  room.numberOfPeople += 1;

  await room.save();
};

export const getRooms = async () => {
  const rooms = await Room.find({
    // relations: {},
  });

  return rooms;
};

export const getRoom = async (roomCode: string) => {
  const room = await Room.findOne({
    where: {
      code: roomCode,
    },
  });

  if (!room) {
    throw new HttpException("Room not found", HttpStatusCode.NOT_FOUND);
  }

  return room;
};

export const updateRoom = async (
  id: string,
  data: Partial<IRoom>,
  currentUser: IUser | undefined,
) => {
  const room = await Room.findOne({
    where: {
      id: id,
    },
    relations: {
      owner: true,
    },
  });

  if (!room) {
    throw new HttpException("Room not found", HttpStatusCode.NOT_FOUND);
  }

  if (!currentUser) {
    throw new HttpException("User doesnt exist", HttpStatusCode.NOT_FOUND);
  }

  // ONLY THE OWNER OF THE ROOM CAN MAKE CHANGES TO THEIR ROOM
  if (room.owner.id !== currentUser.id) {
    throw new HttpException(
      "Access denied. You are not allowed to perform this operation",
      HttpStatusCode.FORBIDDEN,
    );
  }

  // Ensure that fields like 'code' cannot be updated
  const { code, ...allowedUpdates } = data;

  Object.assign(room, allowedUpdates);

  await room.save();

  return room;
};

export const getMyRooms = async (currentUser: IUser | undefined) => {
  if (!currentUser) {
    throw new HttpException("User doesnt exist", HttpStatusCode.NOT_FOUND);
  }

  const user = await User.findOne({
    where: {
      id: currentUser.id,
    },
    relations: {
      room: true,
    },
  });

  if (!user) {
    throw new HttpException("User doesnt exist", HttpStatusCode.NOT_FOUND);
  }

  if (user.room.length === 0) {
    throw new HttpException(
      "You havent joined any rooms. Kindly join one now!",
      HttpStatusCode.NOT_FOUND,
    );
  }

  return user.room;
};
