import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import Room from "../entity/Room";
import { IRoom } from "../interfaces/Room";

class RoomRepository {
  private roomRepository: Repository<IRoom>;

  constructor() {
    this.roomRepository = AppDataSource.getRepository(Room);
  }

  public async create(roomData: Partial<IRoom>): Promise<IRoom> {
    const newRoom = this.roomRepository.create(roomData);
    return this.roomRepository.save(newRoom);
  }

  public async findByCode(code: string): Promise<IRoom | null> {
    return this.roomRepository.findOne({
      where: { code },
    });
  }

  public async findById(
    roomId: string,
    relations: string[] = [],
  ): Promise<IRoom | null> {
    return this.roomRepository.findOne({
      where: { id: roomId },
      relations: relations.length ? relations : undefined,
    });
  }

  public async findByBillingDate(
    billingDate: number,
    relations: string[] = [],
  ): Promise<IRoom[]> {
    return this.roomRepository.find({
      where: { billingDate },
      relations: relations.length ? relations : undefined,
    });
  }

  // Save updates to the room
  public async save(room: IRoom): Promise<IRoom> {
    return this.roomRepository.save(room);
  }

  public async findAll(): Promise<IRoom[]> {
    return this.roomRepository.find();
  }
}

export default new RoomRepository();
