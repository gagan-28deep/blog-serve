import mongoose from "mongoose";

const connectDb = async () => {
  try {
    console.log(process.env.MONGO_DB_URL);
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_URL}`,
    );
    console.log("DB connected");
    console.log(`MongoDB connected , DB-host -> ${connectionInstance}`);
    console.log(
      `MongoDB connected , DB-host -> ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error connecting DB", error);
    process.exit(1);
  }
};

export default connectDb;
