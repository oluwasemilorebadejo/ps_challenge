import dailyBillingJob from "./cronJobs/daillyBilling";

const initializeCronJobs = () => {
  dailyBillingJob.start();
};

export default initializeCronJobs;
