import { cookieOptions } from "../constants.js";
import { database } from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import status from "http-status";
import jwt from "jsonwebtoken";

const UsersCollection = database.collection("users");

const createUser = asyncHandler(async (req, res) => {
  try {
    const userInfo = req.body;

    if (!(userInfo.email && userInfo.name)) {
      throw new ApiError(
        status.NOT_FOUND,
        "User name and email are required!!"
      );
    }

    const existedUser = await UsersCollection.findOne({
      email: userInfo.email,
    });

    if (existedUser) {
      throw new ApiError(status.CONFLICT, "User with email already exist!!");
    }
    userInfo.role = "user";

    const result = await UsersCollection.insertOne(userInfo);

    const registeredUser = await UsersCollection.findOne({
      _id: result.insertedId,
    });

    return res
      .status(status.CREATED)
      .json(
        new ApiResponse(
          status.OK,
          registeredUser,
          "User registered successfully!!"
        )
      );
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, "Something went wrong!!");
  }
});

const issueJwt = asyncHandler(async (req, res) => {
  const user = req.body;

  const loggedInUser = await UsersCollection.findOne({ email: user.email });
  if (!loggedInUser) {
    throw new ApiError(status.NOT_FOUND, "User not found!!");
  }

  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });

  return res
    .status(status.OK)
    .cookie("token", token, cookieOptions)
    .json(new ApiResponse(status.OK, { success: true }, "Success!!"));
});

const UserControllers = { createUser, issueJwt };
export default UserControllers;
