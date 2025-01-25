import { Router } from "express";
import ProductControllers from "../controllers/product.controllers.js";
import UserMiddlewares from "../middlewares/user.middlewares.js";

const router = Router();

router.route("/").get(ProductControllers.getallProduct);
router.route("/product").get(ProductControllers.getSpecificProduct);
router.route("/product/:id").get(ProductControllers.getSpecificProduct);

export default router;
