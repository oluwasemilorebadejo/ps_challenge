import express, { Router } from "express";
// import * as paymentController from "../../controllers/payment";
import PaymentController from "../../controllers/payment";
import AuthMiddleware from "../../middleware/auth";

const router: Router = express.Router();

// router.post("/webhook", paymentController.webhook);

router.use(AuthMiddleware.authorize);

router.route("/:roomCode").post(PaymentController.charge);

export default router;
