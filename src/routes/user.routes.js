import { Router } from "express";
import UserControllers from "../controllers/user.controllers.js";

const router = Router();

router.route("/user").post(UserControllers.createUser);
router.route("/jwt").post(UserControllers.issueJwt);
router.route("/logout").post(UserControllers.logoutUser);

export default router;
