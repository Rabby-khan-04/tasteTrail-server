import { ObjectId } from "mongodb";
import { database } from "../db/index.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import status from "http-status";

const ProductCollection = database.collection("products");

const getallProduct = asyncHandler(async (req, res) => {
  const products = await ProductCollection.find({}).toArray();

  return res
    .status(status.OK)
    .json(
      new ApiResponse(status.OK, products, "Products fetched successfully!!")
    );
});

const getSpecificProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = { _id: new ObjectId(id) };
  const product = await ProductCollection.findOne(query);
  return res
    .status(status.OK)
    .json(
      new ApiResponse(status.OK, product, "Product fetched successfully!!")
    );
});

const ProductControllers = { getallProduct, getSpecificProduct };
export default ProductControllers;
