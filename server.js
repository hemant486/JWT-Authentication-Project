require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const authRouter = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Initialize database connection
connectDB();

// Global Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API CALLS
app.use("/api", userRoutes);
app.use("/auth", authRouter);

// Start the server

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
