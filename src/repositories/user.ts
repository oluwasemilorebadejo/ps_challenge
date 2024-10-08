import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import User from "../entity/User";
import { IUser } from "../interfaces/User";

class UserRepository {
  private userRepository: Repository<IUser>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  public async findByEmail(email: string): Promise<IUser | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  public async create(userData: Partial<IUser>): Promise<IUser> {
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  public async findById(
    userId: string,
    relations: string[] = [],
  ): Promise<IUser | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: relations.length ? relations : undefined,
    });
  }

  public async save(user: IUser): Promise<IUser> {
    return this.userRepository.save(user);
  }

  public async findAll(): Promise<IUser[]> {
    return this.userRepository.find();
  }

  public async findUsersByRoom(roomId: string): Promise<IUser[]> {
    return this.userRepository.find({
      relations: {
        room: true,
      },
      where: {
        room: {
          id: roomId,
        },
      },
    });
  }
}

export default new UserRepository();
