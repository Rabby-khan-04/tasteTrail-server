import { UsersCollection } from "../controllers/user.controllers.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import status from "http-status";
import jwt from "jsonwebtoken";

const verifyJwt = asyncHandler(async (req, _, next) => {
  const token = req.cookies?.token;
  if (!token) {
    throw new ApiError(status.UNAUTHORIZED, "Unauthorized access!!");
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        err.message || "Something went wrong while verifing jwt"
      );
    }
    req.user = decoded;
    next();
  });
});

const verifyAdmin = asyncHandler(async (req, _, next) => {
  const user = req.user;
  const query = { email: user.email };
  const userInfo = await UsersCollection.findOne(query);
  if (userInfo.role === "admin") {
    next();
  } else {
    throw new ApiError(status.FORBIDDEN, "Unauthorized access!!");
  }
});

const UserMiddlewares = { verifyJwt, verifyAdmin };

export default UserMiddlewares;
