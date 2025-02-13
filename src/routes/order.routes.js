import { Router } from "express";
import OrderControllers from "../controllers/order.controllers.js";
import UserMiddlewares from "../middlewares/user.middlewares.js";

const router = Router();

router
  .route("/all-order")
  .get(
    UserMiddlewares.verifyJwt,
    UserMiddlewares.verifyAdmin,
    OrderControllers.getAllOrders
  );

router
  .route("/place-order")
  .post(UserMiddlewares.verifyJwt, OrderControllers.placeAnOrder);

router
  .route("/my-order")
  .get(UserMiddlewares.verifyJwt, OrderControllers.getOrdersByUser);

export default router;
