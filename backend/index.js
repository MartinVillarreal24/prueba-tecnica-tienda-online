import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.js";

import { connectDB } from "./lib/db.js";
import analyticsRoutes from "./routes/analytics.js";
import cartRoutes from "./routes/cart.js";
import couponRoutes from "./routes/coupon.js";
import paymentRoutes from "./routes/payment.js";
import productRoutes from "./routes/product.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "10mb" })); // esto permite analizar el cuerpo de la solicitud
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/analytics", analyticsRoutes);

app.listen(PORT, () => {
  console.log("Servidor corriendo en: http://localhost:" + PORT);
  connectDB();
});
