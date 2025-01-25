import { Router } from "express";
import OrderControllers from "../controllers/order.controllers.js";
import UserMiddlewares from "../middlewares/user.middlewares.js";

const router = Router();

router
  .route("/place-order")
  .post(UserMiddlewares.verifyJwt, OrderControllers.placeAnOrder);

router
  .route("/my-order")
  .get(UserMiddlewares.verifyJwt, OrderControllers.getOrdersByUser);

router
  .route("/")
  .get(
    UserMiddlewares.verifyJwt,
    UserMiddlewares.verifyAdmin,
    OrderControllers.getAllOrders
  );

export default router;
