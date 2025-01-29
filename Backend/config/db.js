import mongoose from "mongoose";

// function to connect to the mongoDB database

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("MongoDB connected");
        });
        await mongoose.connect(`${process.env.MONGODB_URI}/jobsphere`)
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;