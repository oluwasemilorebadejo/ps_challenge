import express, { Router } from "express";
import * as paymentController from "../../controllers/payment";
import { authorize } from "../../middleware/auth";

const router: Router = express.Router();

// router.post("/webhook", paymentController.webhook);

router.use(authorize);

router.route("/:roomCode").post(paymentController.charge);

export default router;
