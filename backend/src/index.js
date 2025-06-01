import dotenv from "dotenv";
dotenv.config();

import express from "express";

import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";

const app = express();

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use("/api/auth", authRoutes);

app.listen(5001, () => {
  console.log("server is listening on PORT: ", process.env.PORT);
  connectDB();
});
