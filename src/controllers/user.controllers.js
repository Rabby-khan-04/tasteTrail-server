import { cookieOptions } from "../constants.js";
import { database } from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import status from "http-status";
import jwt from "jsonwebtoken";

export const UsersCollection = database.collection("users");

const createUser = asyncHandler(async (req, res) => {
  const userInfo = req.body;

  if (!(userInfo.email && userInfo.name)) {
    throw new ApiError(
      status.BAD_REQUEST,
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

  try {
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

  const userPayload = {
    id: loggedInUser._id,
    email: loggedInUser.email,
    name: loggedInUser.name,
  };

  const token = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });

  return res
    .status(status.OK)
    .cookie("token", token, cookieOptions)
    .json(new ApiResponse(status.OK, { success: true }, "Success!!"));
});

const getAUser = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const query = { email };

  const user = await UsersCollection.findOne(query);

  return res
    .status(status.OK)
    .json(new ApiResponse(status.OK, user, "User fetch successfully!!"));
});

const logoutUser = asyncHandler(async (req, res) => {
  return res
    .status(status.OK)
    .clearCookie("token", { ...cookieOptions, maxAge: 0 })
    .json(new ApiResponse(status.OK, { success: true }, "Success"));
});

const UserControllers = { createUser, issueJwt, getAUser, logoutUser };
export default UserControllers;
