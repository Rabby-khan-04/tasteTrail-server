import { database } from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import status from "http-status";

const UsersCollection = database.collection("users");

const createUser = asyncHandler(async (req, res) => {
  const userInfo = req.body;

  if (!(userInfo.email && userInfo.name)) {
    throw new ApiError(status.NOT_FOUND, "User name and email are required!!");
  }

  const existedUser = await UsersCollection.findOne({ email: userInfo.email });

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
});

const UserControllers = { createUser };
export default UserControllers;
