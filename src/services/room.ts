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
  if (!owner) {
    throw new HttpException(
      "Owner is required to create a room",
      HttpStatusCode.NOT_FOUND,
    );
  }

  const ownerUser = await User.findOne({
    where: { id: owner.id },
    relations: {
      room: true,
    },
  });

  if (!ownerUser) {
    throw new HttpException("User not found", HttpStatusCode.NOT_FOUND);
  }

  const newRoom = Room.create({
    code: generateRoomCode(),
    name: data.name,
    amountPerPerson: data.amountPerPerson,
    maxNumberOfPeople: data.maxNumberOfPeople,
    billingDate: data.billingDate,
    joinedAt: new Date(),
    owner: ownerUser,
  });

  await newRoom.save();

  // Add the owner as a member of the room
  ownerUser.room = [...(ownerUser.room || []), newRoom];
  await ownerUser.save();

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

  if (user.room.length === 0) {
    throw new HttpException(
      "You havent joined any rooms. Kindly join one now!",
      HttpStatusCode.NOT_FOUND,
    );
  }

  return user.room;
};

export const leaveRoom = async (
  code: string,
  currentUser: IUser | undefined,
) => {
  const room = await Room.findOne({
    where: { code: code },
    relations: { owner: true },
  });

  if (!room) {
    throw new HttpException("Room not found", HttpStatusCode.NOT_FOUND);
  }

  const user = await User.findOne({
    where: {
      id: currentUser?.id,
    },
    relations: {
      room: true,
    },
  });

  if (!user) {
    throw new HttpException("User not found", HttpStatusCode.NOT_FOUND);
  }

  // Check if the user is part of the room
  const isUserInRoom = user.room.some((userRoom) => userRoom.id === room.id);

  if (!isUserInRoom) {
    throw new HttpException(
      "You are not a member of this room",
      HttpStatusCode.BAD_REQUEST,
    );
  }

  // Remove the room from the user's rooms list
  user.room = user.room.filter((userRoom) => userRoom.id !== room.id);

  // Decrease the number of people in the room
  room.numberOfPeople = room.numberOfPeople > 1 ? room.numberOfPeople - 1 : 0;

  // Save both the user and the room entities
  await user.save();
  await room.save();
};
