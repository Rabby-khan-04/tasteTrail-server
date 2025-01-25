import { database } from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import status from "http-status";
import { ProductCollection } from "./product.controllers.js";
import { ObjectId } from "mongodb";
import ApiResponse from "../utils/ApiResponse.js";

const OrderCollection = database.collection("orders");

const placeAnOrder = asyncHandler(async (req, res) => {
  const { productId, userId, quantity } = req.body;
  if (!productId || !userId || !quantity || quantity <= 0) {
    throw new ApiError(status.BAD_REQUEST, "All field are required");
  }
  const productQuery = { _id: new ObjectId(productId) };

  const orderdProduct = await ProductCollection.findOne(productQuery);
  if (!orderdProduct) {
    throw new ApiError(status.NOT_FOUND, "Product not found!!");
  }

  if (orderdProduct?.addBy?.email === req.user?.email) {
    throw new ApiError(
      status.BAD_REQUEST,
      "You can't order your own product!!"
    );
  }

  if (orderdProduct.quantity < quantity) {
    throw new ApiError(status.BAD_REQUEST, "Insufficient stock available!!");
  }

  const orderInfo = { productId, userId, quantity, orderDate: new Date() };

  try {
    const orderResult = await OrderCollection.insertOne(orderInfo);

    if (!orderResult.insertedId) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Failed to place order!!"
      );
    }

    const updateCount = {
      $inc: { ordersCount: quantity, quantity: -quantity },
    };
    const productResult = await ProductCollection.updateOne(
      productQuery,
      updateCount
    );

    if (productResult.modifiedCount === 0) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Failed to place order!!"
      );
    }

    return res
      .status(status.OK)
      .json(
        new ApiResponse(
          status.OK,
          { success: true },
          "Order placed successfully!!"
        )
      );
  } catch (error) {
    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      error.message || "Something went wrong while ordering!!"
    );
  }
});

const OrderControllers = { placeAnOrder };
export default OrderControllers;
