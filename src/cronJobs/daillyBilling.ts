import cron from "node-cron";
// import * as paymentService from "../services/payment";
import PaymentService from "../services/payment";
// * * * * * every minute
// 0 0 * * * every midnight

// Daily billing cron job: runs at midnight every day
const dailyBillingJob = cron.schedule("0 0 * * *", async () => {
  try {
    await PaymentService.runDailyBilling();
  } catch (error) {
    console.error("Error running daily billing job", error);
  }
});

export default dailyBillingJob;
