import express from "express";
import "dotenv/config";
import prisma from "./prisma.js";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import orderRoutes from "./routes/order.routes.js";

const app = express();

app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.json({
    message: "E-commerce API is running"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "E-commerce API is healthy"
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});