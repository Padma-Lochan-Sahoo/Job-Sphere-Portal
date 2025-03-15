import dotenv from 'dotenv';
import { app } from './app.js';
import connectDB from './config/db.js';
import connectCloudinary from './config/cloudinary.js';

dotenv.config();

// const startServer = async () => {
//   try {
//     await connectDB();
//     console.log("✅ MongoDB Connected");

//     await connectCloudinary();
//     console.log("✅ Cloudinary Connected");

//     if (process.env.NODE_ENV !== "production") {
//       const port = process.env.PORT ;
//       app.listen(port, "0.0.0.0",() => {
//         console.log(`🚀 Server running on http://localhost:${port}`);
//       });
//     }
//   } catch (error) {
//     console.error("❌ Error starting the server:", error);
//     process.exit(1); // Exit process on failure
//   }
// };

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected");

    await connectCloudinary();
    console.log("✅ Cloudinary Connected");

    const port = process.env.PORT || 3000; // Fallback to 3000 if PORT is not set
    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Error starting the server:", error);
    process.exit(1); // Exit process on failure
  }
};

// Start the server
startServer();

// Export for Vercel
export default app;
