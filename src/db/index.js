import { MongoClient, ServerApiVersion } from "mongodb";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const database = client.db("teastTrail");

async function connectDB() {
  try {
    console.log("Successfully connected to MongoDB!");
  } catch (err) {
    console.log(`MONGODB Connection ERROR: ${err}`);
  }
}

export default connectDB;
