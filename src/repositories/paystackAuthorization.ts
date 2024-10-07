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

  // Create a new Paystack Authorization
  public async create(
    authorizationData: Partial<IPaystackAuthorization>,
  ): Promise<IPaystackAuthorization> {
    const newAuthorization =
      this.paystackAuthorizationRepository.create(authorizationData);
    return this.paystackAuthorizationRepository.save(newAuthorization);
  }

  // Find authorization by ID
  public async findById(
    authorizationId: string,
  ): Promise<IPaystackAuthorization | null> {
    return this.paystackAuthorizationRepository.findOne({
      where: { id: authorizationId },
    });
  }

  // Find authorization by signature
  public async findBySignature(
    signature: string,
  ): Promise<IPaystackAuthorization | null> {
    return this.paystackAuthorizationRepository.findOne({
      where: { signature },
    });
  }

  // Find authorization by user ID
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
