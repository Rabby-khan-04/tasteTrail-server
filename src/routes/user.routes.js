import { Router } from "express";
import UserControllers from "../controllers/user.controllers.js";

const router = Router();

router.route("/user").post(UserControllers.createUser);

export default router;
