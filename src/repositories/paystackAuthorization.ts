import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import PaystackAuthorization from "../entity/PaystackAuthorization";
import { IPaystackAuthorization } from "../interfaces/PaystackAuthorization";

class PaystackAuthorizationRepository {
  private paystackAuthorizationRepository: Repository<IPaystackAuthorization>;

  constructor() {
    this.paystackAuthorizationRepository = AppDataSource.getRepository(
      PaystackAuthorization,
    );
  }

  public async create(
    authorizationData: Partial<IPaystackAuthorization>,
  ): Promise<IPaystackAuthorization> {
    const newAuthorization =
      this.paystackAuthorizationRepository.create(authorizationData);
    return this.paystackAuthorizationRepository.save(newAuthorization);
  }

  public async findById(
    authorizationId: string,
  ): Promise<IPaystackAuthorization | null> {
    return this.paystackAuthorizationRepository.findOne({
      where: { id: authorizationId },
    });
  }

  public async findBySignature(
    signature: string,
  ): Promise<IPaystackAuthorization | null> {
    return this.paystackAuthorizationRepository.findOne({
      where: { signature },
    });
  }

  public async findByUserId(
    userId: string,
  ): Promise<IPaystackAuthorization | null> {
    return this.paystackAuthorizationRepository.findOne({
      where: { user: { id: userId } },
    });
  }

  // Save authorization (updates)
  public async save(
    authorization: IPaystackAuthorization,
  ): Promise<IPaystackAuthorization> {
    return this.paystackAuthorizationRepository.save(authorization);
  }
}

export default new PaystackAuthorizationRepository();
