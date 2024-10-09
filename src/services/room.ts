import { IRoom } from "../interfaces/Room";
import { IUser } from "../interfaces/User";
import HttpException from "../utils/exceptions/http.exception";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import userRepository from "../repositories/user";
import roomRepository from "../repositories/room";
import { CreateRoomDto, UpdateRoomDto } from "../dtos/room.dto";
import { Inject, Service } from "typedi";
import UserRepository from "../repositories/user";
import RoomRepository from "../repositories/room";

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

@Service()
class RoomService {
  constructor(
    @Inject()
    private readonly userRepository: UserRepository,
    @Inject()
    private readonly roomRepository: RoomRepository,
  ) {}
  /**
   * createRoom
   */
  public async createRoom(data: CreateRoomDto, owner: IUser): Promise<IRoom> {
    const ownerUser = await this.userRepository.findById(owner.id, ["room"]);

    if (!ownerUser) {
      throw new HttpException("User not found", HttpStatusCode.NOT_FOUND);
    }

    const newRoom = await this.roomRepository.create({
      ...data,
      code: generateRoomCode(),
      joinedAt: new Date(),
      owner: ownerUser,
    });

    // Add the owner as a member of the room
    ownerUser.room = [...(ownerUser.room || []), newRoom];
    await this.userRepository.save(ownerUser);

    return newRoom;
  }

  /**
   * joinRoom
   */
  public async joinRoom(code: string, currentUser: IUser): Promise<void> {
    const room = await this.roomRepository.findByCode(code);

    if (!room) {
      throw new HttpException("Room not found", HttpStatusCode.NOT_FOUND);
    }

    const user = await this.userRepository.findById(currentUser.id, ["room"]);

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

    await this.userRepository.save(user);

    // THIS OPERATION CAN BE STOPPED IF USER SAVE FAILS

    // Increment the number of people in the room
    room.numberOfPeople += 1;

    await this.roomRepository.save(room);
  }

  /**
   * getRooms
   */
  public async getRooms(): Promise<IRoom[]> {
    const room = await this.roomRepository.findAll();

    return room;
  }

  /**
   * getRoom
   */
  public async getRoom(roomCode: string) {
    const room = await this.roomRepository.findByCode(roomCode);

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
    data: UpdateRoomDto,
    currentUser: IUser,
  ): Promise<IRoom> {
    const room = await this.roomRepository.findById(roomId, ["owner"]);

    if (!room) {
      throw new HttpException("Room not found", HttpStatusCode.NOT_FOUND);
    }

    const user = await this.userRepository.findById(currentUser.id);

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

    Object.assign(room, data);

    await this.roomRepository.save(room);

    return room;
  }

  /**
   * getMyRooms
   */
  public async getMyRooms(currentUser: IUser): Promise<IRoom[]> {
    const user = await this.userRepository.findById(currentUser.id, ["room"]);

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
    const room = await this.roomRepository.findByCode(code);

    if (!room) {
      throw new HttpException("Room not found", HttpStatusCode.NOT_FOUND);
    }

    const user = await this.userRepository.findById(currentUser.id, ["room"]);

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

    await this.userRepository.save(user);
    await this.roomRepository.save(room);
  }
}

export default RoomService;
