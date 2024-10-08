import { IRoom } from "../interfaces/Room";
import { IUser } from "../interfaces/User";
import HttpException from "../utils/exceptions/http.exception";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import userRepository from "../repositories/user";
import roomRepository from "../repositories/room";

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

class RoomService {
  /**
   * createRoom
   */
  public async createRoom(data: Partial<IRoom>, owner: IUser): Promise<IRoom> {
    const ownerUser = await userRepository.findById(owner.id, ["room"]);

    if (!ownerUser) {
      throw new HttpException("User not found", HttpStatusCode.NOT_FOUND);
    }

    const newRoom = await roomRepository.create({
      code: generateRoomCode(),
      name: data.name,
      amountPerPerson: data.amountPerPerson,
      maxNumberOfPeople: data.maxNumberOfPeople,
      billingDate: data.billingDate,
      joinedAt: new Date(),
      owner: ownerUser,
    });

    // Add the owner as a member of the room
    ownerUser.room = [...(ownerUser.room || []), newRoom];
    await userRepository.save(ownerUser);

    return newRoom;
  }

  /**
   * joinRoom
   */
  public async joinRoom(code: string, currentUser: IUser): Promise<void> {
    const room = await roomRepository.findByCode(code);

    if (!room) {
      throw new HttpException("Room not found", HttpStatusCode.NOT_FOUND);
    }

    const user = await userRepository.findById(currentUser.id, ["room"]);

    if (!user) {
      throw new HttpException("User doesn't exist", HttpStatusCode.NOT_FOUND);
    }

    if (room.numberOfPeople >= room.maxNumberOfPeople) {
      throw new HttpException("Room is filled up", HttpStatusCode.BAD_REQUEST);
    }

    if (user.room.some((r) => r.id === room.id)) {
      throw new HttpException(
        "You are already a member of this room",
        HttpStatusCode.BAD_REQUEST,
      );
    }

    user.room = [...user.room, room];

    await userRepository.save(user);

    // THIS OPERATION CAN BE STOPPED IF USER SAVE FAILS

    // Increment the number of people in the room
    room.numberOfPeople += 1;

    await roomRepository.save(room);
  }

  /**
   * getRooms
   */
  public async getRooms(): Promise<IRoom[]> {
    const room = await roomRepository.findAll();

    return room;
  }

  /**
   * getRoom
   */
  public async getRoom(roomCode: string) {
    const room = await roomRepository.findByCode(roomCode);

    if (!room) {
      throw new HttpException("Room not found", HttpStatusCode.NOT_FOUND);
    }

    return room;
  }

  /**
   * updateRoom
   */
  public async updateRoom(
    roomId: string,
    data: Partial<IRoom>,
    currentUser: IUser,
  ): Promise<IRoom> {
    const room = await roomRepository.findById(roomId, ["owner"]);

    if (!room) {
      throw new HttpException("Room not found", HttpStatusCode.NOT_FOUND);
    }

    const user = await userRepository.findById(currentUser.id);

    if (!user) {
      throw new HttpException("User doesnt exist", HttpStatusCode.NOT_FOUND);
    }

    // ONLY THE OWNER OF THE ROOM CAN MAKE CHANGES TO THEIR ROOM
    if (room.owner.id !== user.id) {
      throw new HttpException(
        "Access denied. You are not allowed to perform this operation",
        HttpStatusCode.FORBIDDEN,
      );
    }

    const { code, ...allowedUpdates } = data;

    Object.assign(room, allowedUpdates);

    await roomRepository.save(room);

    return room;
  }

  /**
   * getMyRooms
   */
  public async getMyRooms(currentUser: IUser): Promise<IRoom[]> {
    const user = await userRepository.findById(currentUser.id, ["room"]);

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
  }

  /**
   * leaveRoom
   */
  public async leaveRoom(code: string, currentUser: IUser): Promise<void> {
    const room = await roomRepository.findByCode(code);

    if (!room) {
      throw new HttpException("Room not found", HttpStatusCode.NOT_FOUND);
    }

    const user = await userRepository.findById(currentUser.id, ["room"]);

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

    user.room = user.room.filter((userRoom) => userRoom.id !== room.id);

    room.numberOfPeople = room.numberOfPeople > 1 ? room.numberOfPeople - 1 : 0;

    await userRepository.save(user);
    await roomRepository.save(room);
  }
}

export default new RoomService();
