import { database } from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import status from "http-status";
import { ProductCollection } from "./product.controllers.js";
import { ObjectId } from "mongodb";
import ApiResponse from "../utils/ApiResponse.js";

const OrderCollection = database.collection("orders");

const placeAnOrder = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const { id } = req.user;
  if (!productId || !quantity || quantity <= 0) {
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

  const orderInfo = { productId, userId: id, quantity, orderDate: new Date() };

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

const getOrdersByUser = asyncHandler(async (req, res) => {
  const { email } = req.query;
  const user = req.user;

  if (email !== user?.email) {
    throw new ApiError(status.UNAUTHORIZED, "Unauthorized access!!");
  }
  const orderQuery = { userId: user.id };
  try {
    const orders = await OrderCollection.aggregate([
      {
        $match: orderQuery,
      },
      {
        $addFields: {
          productId: { $toObjectId: "$productId" },
          // userId: { $toObjectId: "$userId" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "userId",
      //     foreignField: "_id",
      //     as: "orderBy",
      //   },
      // },
      // {
      //   $addFields: {
      //     product: {
      //       $first: "$product",
      //     },
      //     orderBy: {
      //       $arrayElemAt: ["$orderBy", 0],
      //     },
      //   },
      // },
      {
        $unwind: "$product",
      },
      // {
      //   $unwind: "$orderBy",
      // },
      {
        $project: {
          _id: 1,
          quantity: 1,
          orderDate: 1,
          "product._id": 1,
          "product.name": 1,
          "product.image": 1,
          "product.price": 1,
          "product.addBy.name": 1,
          "product.addBy.email": 1,
        },
      },
    ]).toArray();

    return res
      .status(status.OK)
      .json(
        new ApiResponse(status.OK, orders, "Orders fetched successfully!!")
      );
  } catch (error) {
    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      error.message || "Failed to fetch order!!"
    );
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await OrderCollection.aggregate([
      {
        $match: {},
      },
      {
        $addFields: {
          productId: { $toObjectId: "$productId" },
          userId: { $toObjectId: "$userId" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "orderBy",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $unwind: "$orderBy",
      },
      {
        $project: {
          _id: 1,
          quantity: 1,
          orderDate: 1,
          "product._id": 1,
          "product.name": 1,
          "product.image": 1,
          "product.category": 1,
          "product.price": 1,
          "product.addBy.name": 1,
          "product.addBy.email": 1,
          "product.ordersCount": 1,
          "orderBy.name": 1,
          "orderBy.email": 1,
        },
      },
    ]).toArray();

    return res
      .status(status.OK)
      .json(
        new ApiResponse(status.OK, orders, "Orders fetched successfully!!")
      );
  } catch (error) {
    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      error.message || "Failed to fetch orders!!"
    );
  }
});

const OrderControllers = { placeAnOrder, getOrdersByUser, getAllOrders };
export default OrderControllers;
