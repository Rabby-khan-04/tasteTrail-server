import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({ path: "../.env" });
const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(`SERVER ERROR: ${error}`);
    });

    app.listen(port, () => {
      console.log(`Teaste Trail Server is running on PORT: ${port}`);
    });
  })
  .catch((err) => {
    console.log(`MongoDB connection faild !!! ${err}`);
  });
