import express, { Router } from "express";
// import * as paymentController from "../../controllers/payment";
import PaymentController from "../../controllers/payment";
import AuthMiddleware from "../../middleware/auth";
import { Container } from "typedi";

const router: Router = express.Router();

const paymentController = Container.get(PaymentController);

// router.post("/webhook", paymentController.webhook);

router.use(AuthMiddleware.authorize);

router.route("/:roomCode").post(paymentController.charge);

export default router;
