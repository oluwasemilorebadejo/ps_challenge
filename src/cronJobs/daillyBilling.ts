import cron from "node-cron";
import { Container } from "typedi";
import PaymentService from "../services/payment";

const paymentService = Container.get(PaymentService);

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
