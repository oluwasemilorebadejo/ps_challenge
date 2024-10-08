import axios, { AxiosResponse } from "axios";
import config from "config";
import HttpException from "../utils/exceptions/http.exception";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { IUser } from "../interfaces/User";
import { TransactionStatus, TransactionType } from "../enums/Transaction";
import { IPaystackAuthorization } from "../interfaces/PaystackAuthorization";
import userRepository from "../repositories/user";
import roomRepository from "../repositories/room";
import transactionRepository from "../repositories/transaction";
import paystackAuthorizationRepository from "../repositories/paystackAuthorization";
import { fetchUserAndRoom } from "../helpers/userRoom";
import { createTransaction } from "../helpers/transaction";

class PaymentService {
  public async chargeUser(
    roomCode: string,
    currentUser: IUser,
  ): Promise<AxiosResponse> {
    const { user, room } = await fetchUserAndRoom(roomCode, currentUser);

    const newTransaction = await createTransaction(
      room.amountPerPerson,
      user,
      room,
      TransactionType.INITIAL,
    );

    const params = {
      email: user.email,
      amount: room.amountPerPerson * 100,
      channels: ["card"],
      reference: newTransaction.id,
    };

    const options = {
      headers: {
        Authorization: `Bearer ${config.get<string>("paystack_secret_key")}`,
        "Content-Type": "application/json",
      },
    };

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      params,
      options,
    );

    return response.data;
  }

  public async handleChargeSuccess(event: any): Promise<void> {
    const updatedTransaction = await transactionRepository.findById(
      event.data.reference,
    );

    if (!updatedTransaction) {
      throw new HttpException(
        "Transaction not found",
        HttpStatusCode.NOT_FOUND,
      );
    }

    updatedTransaction.status = TransactionStatus.SUCCESS;
    await transactionRepository.save(updatedTransaction);

    const user = await userRepository.findByEmail(event.data.customer.email);

    if (!user) {
      throw new HttpException("User not found", HttpStatusCode.NOT_FOUND);
    }

    const authorization = event.data.authorization;
    const existingAuthorization =
      await paystackAuthorizationRepository.findBySignature(
        authorization.signature,
      );

    if (existingAuthorization) return;

    await paystackAuthorizationRepository.create({
      authorizationCode: authorization.authorization_code,
      bank: authorization.bank,
      bin: authorization.bin,
      cardType: authorization.card_type,
      channel: authorization.channel,
      countryCode: authorization.country_code,
      expMonth: authorization.exp_month,
      expYear: authorization.exp_year,
      last4: authorization.last4,
      reusable: authorization.reusable,
      signature: authorization.signature,
      transaction: updatedTransaction,
      user: user,
    });
  }

  public async chargeUserJob(
    roomCode: string,
    currentUser: IUser,
    authorization: IPaystackAuthorization,
  ): Promise<AxiosResponse> {
    const { user, room } = await fetchUserAndRoom(roomCode, currentUser);

    const auth = await paystackAuthorizationRepository.findById(
      authorization.id,
    );

    if (!auth) {
      throw new HttpException(
        "Authorization not found",
        HttpStatusCode.NOT_FOUND,
      );
    }

    const newTransaction = await createTransaction(
      room.amountPerPerson,
      user,
      room,
      TransactionType.RECURRING,
    );

    const params = {
      email: user.email,
      amount: room.amountPerPerson * 100,
      channels: ["card"],
      reference: newTransaction.id,
      authorization_code: authorization.authorizationCode,
    };

    const options = {
      headers: {
        Authorization: `Bearer ${config.get<string>("paystack_secret_key")}`,
        "Content-Type": "application/json",
      },
    };

    const response = await axios.post(
      "https://api.paystack.co/transaction/charge_authorization",
      params,
      options,
    );

    return response.data;
  }

  public async runDailyBilling(): Promise<void> {
    const today = new Date().getDate();
    const roomsToBill = await roomRepository.findByBillingDate(today, [
      "owner",
    ]);

    for (const room of roomsToBill) {
      const contributors = await userRepository.findUsersByRoom(room.id);

      for (const contributor of contributors) {
        const authorization =
          await paystackAuthorizationRepository.findByUserId(contributor.id);

        if (!authorization) {
          console.warn(
            `Authorization not found for user ${contributor.email} in room ${room.code}`,
          );
          continue;
        }

        await this.chargeUserJob(room.code, contributor, authorization);
      }
    }
  }
}

export default new PaymentService();
