import cron from "node-cron";
// import * as paymentService from "../services/payment";
import PaymentService from "../services/payment";
import UserRepository from "../repositories/user";
import TransactionRepository from "../repositories/transaction";
import RoomRepository from "../repositories/room";
import PaystackAuthorizationRepository from "../repositories/paystackAuthorization";
import { Container } from "typedi";

const paymentService = Container.get(PaymentService);

// const paystackAuthorizationRepository = new PaystackAuthorizationRepository();
// const userRepository = new UserRepository();
// const transactionRepository = new TransactionRepository();
// const roomRepository = new RoomRepository();
// const paymentService = new PaymentService(
//   userRepository,
//   transactionRepository,
//   roomRepository,
//   paystackAuthorizationRepository,
// );
// * * * * * every minute
// 0 0 * * * every midnight

// Daily billing cron job: runs at midnight every day
const dailyBillingJob = cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Daily billing job started");
    await paymentService.runDailyBilling();
  } catch (error) {
    console.error("Error running daily billing job", error);
  }
});

export default dailyBillingJob;
