import { Router } from "express";
import OrderControllers from "../controllers/order.controllers.js";
import UserMiddlewares from "../middlewares/user.middlewares.js";

const router = Router();

router
  .route("/place-order")
  .post(UserMiddlewares.verifyJwt, OrderControllers.placeAnOrder);

export default router;
