import { ObjectId } from "mongodb";
import { database } from "../db/index.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import status from "http-status";
import ApiError from "../utils/ApiError.js";

export const ProductCollection = database.collection("products");

const getAllProducts = asyncHandler(async (req, res) => {
  const size = parseInt(req.query.size) || 0;
  const page = parseInt(req.query.page);
  const category = req.query.category;
  const origin = req.query.origin;
  const skip = size * page;

  let query = {};

  if (category && category.length > 0) {
    query.category = { $in: category };
  }
  if (origin && origin.length > 0) {
    query.origin = { $in: origin };
  }
  if (origin && origin.length > 0 && category && category.length > 0) {
    query = {
      $or: [{ category: { $in: category } }, { origin: { $in: origin } }],
    };
  }
  try {
    const products = await ProductCollection.find(query)
      .project({
        name: 1,
        image: 1,
        category: 1,
        price: 1,
        quantity: 1,
        description: 1,
      })
      .sort({ ordersCount: -1 })
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

const getAllProductInfo = asyncHandler(async (req, res) => {
  try {
    const result = await ProductCollection.estimatedDocumentCount();
    // const productCategory = await ProductCollection.find({})
    //   .project({ category: 1 })
    //   .toArray();

    const productCategories = await ProductCollection.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { _id: 0, category: "$_id", count: 1 } },
    ]).toArray();

    const productOrigins = await ProductCollection.aggregate([
      { $group: { _id: "$origin", count: { $sum: 1 } } },
      {
        $project: { _id: 0, origin: "$_id", count: 1 },
      },
    ]).toArray();

    return res.status(status.OK).json(
      new ApiResponse(
        status.OK,
        {
          count: result,
          categories: productCategories,
          origins: productOrigins,
        },
        "Product count fetched successfully!!"
      )
    );
  } catch (error) {
    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      error.message || "Failed to fetch product count!!"
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
  getAllProductInfo,
};
export default ProductControllers;
