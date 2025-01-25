import { Router } from "express";
import ProductControllers from "../controllers/product.controllers.js";
import UserMiddlewares from "../middlewares/user.middlewares.js";

const router = Router();

router.route("/products").get(ProductControllers.getAllProducts);
router.route("/product").get(ProductControllers.getSpecificProduct);
router.route("/product/:id").get(ProductControllers.getSpecificProduct);
router
  .route("/my-products")
  .get(UserMiddlewares.verifyJwt, ProductControllers.getProductByUser);
router
  .route("/product")
  .post(UserMiddlewares.verifyJwt, ProductControllers.addAProduct);

router
  .route("/product/:id")
  .patch(UserMiddlewares.verifyJwt, ProductControllers.updateAProduct);

export default router;
