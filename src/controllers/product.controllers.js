import { ObjectId } from "mongodb";
import { database } from "../db/index.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import status from "http-status";
import ApiError from "../utils/ApiError.js";

export const ProductCollection = database.collection("products");

const getAllProducts = asyncHandler(async (req, res) => {
  const size = parseInt(req.query.size);
  const page = parseInt(req.query.page);
  const skip = size * page;

  console.log({ size, page, skip });

  try {
    const products = await ProductCollection.find({})
      .skip(skip)
      .limit(size)
      .toArray();

    return res
      .status(status.OK)
      .json(
        new ApiResponse(status.OK, products, "Products fetched successfully!!")
      );
  } catch (error) {
    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while fetching products!!"
    );
  }
});

const getSpecificProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = { _id: new ObjectId(id) };
  try {
    const product = await ProductCollection.findOne(query);
    return res
      .status(status.OK)
      .json(
        new ApiResponse(status.OK, product, "Product fetched successfully!!")
      );
  } catch (error) {
    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while fetching products!!"
    );
  }
});

const getProductByUser = asyncHandler(async (req, res) => {
  const { email } = req.query;
  const user = req.user;

  if (email !== user.email) {
    throw new ApiError(status.FORBIDDEN, "Unauthorized access!!");
  }
  try {
    const query = { "addBy.email": email };
    const products = await ProductCollection.find(query).toArray();

    return res
      .status(status.OK)
      .json(
        new ApiResponse(status.OK, products, "Products fetched successfully!!")
      );
  } catch (error) {
    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while fetching products!!"
    );
  }
});

const addAProduct = asyncHandler(async (req, res) => {
  const { name, image, category, quantity, price, addBy, origin, description } =
    req.body;

  if (
    !name ||
    !image ||
    !category ||
    !quantity ||
    !price ||
    !addBy ||
    !addBy.name ||
    !addBy.email ||
    !origin ||
    !description
  ) {
    throw new ApiError(status.BAD_REQUEST, "All field are required!!");
  }

  if (req.user?.email !== addBy.email) {
    throw new ApiError(status.FORBIDDEN, "Unauthorized access!!");
  }

  const productDoc = {
    name,
    image,
    category,
    quantity,
    price,
    addBy,
    origin,
    description,
    ordersCount: 0,
  };

  try {
    const result = await ProductCollection.insertOne(productDoc, { new: true });

    const product = await ProductCollection.findOne({ _id: result.insertedId });

    return res
      .status(status.CREATED)
      .json(
        new ApiResponse(status.OK, product, "Product added successfully!!")
      );
  } catch (error) {
    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      error.message || "Something went wrong while adding product!!"
    );
  }
});

const updateAProduct = asyncHandler(async (req, res) => {
  const { name, image, category, quantity, price, addBy, origin, description } =
    req.body;

  if (
    !name ||
    !image ||
    !category ||
    !quantity ||
    !price ||
    !addBy ||
    !addBy.name ||
    !addBy.email ||
    !origin ||
    !description
  ) {
    throw new ApiError(status.BAD_REQUEST, "All field are required!!");
  }

  if (req.user?.email !== addBy.email) {
    throw new ApiError(status.FORBIDDEN, "Unauthorized access!!");
  }
  const { id } = req.params;
  const query = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      name,
      image,
      category,
      quantity,
      price,
      "addBy.name": addBy.name,
      "addBy.email": addBy.email,
      origin,
      description,
    },
  };

  try {
    const result = await ProductCollection.updateOne(query, updatedDoc, {
      upsert: true,
    });

    return res
      .status(status.OK)
      .json(
        new ApiResponse(status.OK, result, "Product updated successfully!!!")
      );
  } catch (error) {
    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      error.message || "Something went wrong while adding product!!"
    );
  }
});

const ProductControllers = {
  getAllProducts,
  getSpecificProduct,
  getProductByUser,
  addAProduct,
  updateAProduct,
};
export default ProductControllers;
