import { Router } from "express";
import UserControllers from "../controllers/user.controllers.js";
import UserMiddlewares from "../middlewares/user.middlewares.js";

const router = Router();

router.route("/user").post(UserControllers.createUser);
router.route("/jwt").post(UserControllers.issueJwt);
router
  .route("/logout")
  .post(UserMiddlewares.verifyJwt, UserControllers.logoutUser);

export default router;
