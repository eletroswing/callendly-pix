import mongoose from "mongoose";

import logger from "./logger";

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/koa_graphql');
    logger.log("Mongo db has been connected...")
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;