import mongoose from "mongoose";
import {ENV_VARS} from "../config/envVars.js";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(ENV_VARS.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

export default connectDB;