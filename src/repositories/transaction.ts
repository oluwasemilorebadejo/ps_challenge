import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import Transaction from "../entity/Transaction";
import { ITransaction } from "../interfaces/Transaction";

class TransactionRepository {
  private transactionRepository: Repository<ITransaction>;

  constructor() {
    this.transactionRepository = AppDataSource.getRepository(Transaction);
  }

  public async create(
    transactionData: Partial<ITransaction>,
  ): Promise<ITransaction> {
    const newTransaction = this.transactionRepository.create(transactionData);
    return this.transactionRepository.save(newTransaction);
  }

  public async findById(transactionId: string): Promise<ITransaction | null> {
    return this.transactionRepository.findOne({
      where: { id: transactionId },
    });
  }

  public async save(transaction: ITransaction): Promise<ITransaction> {
    return this.transactionRepository.save(transaction);
  }
}

export default new TransactionRepository();
