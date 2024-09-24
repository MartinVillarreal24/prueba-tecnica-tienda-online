import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getRecommendedProducts,
  toggleFeaturedProduct,
  updateProduct,
} from "../controllers/product.js";
import { adminRoute, protectedRoute } from "../middleware/authMiddleware.js";

/**
 * Rutas para gestionar los productos en la tienda.
 *
 * Estas rutas permiten a los administradores realizar operaciones CRUD
 * sobre los productos, así como acceder a productos destacados, por categoría
 * y recomendaciones.
 *
 * - `GET /`: Obtiene todos los productos (requiere autenticación y rol de admin).
 * - `GET /featured`: Obtiene productos destacados.
 * - `GET /category/:category`: Obtiene productos por categoría.
 * - `GET /recommendations`: Obtiene productos recomendados aleatoriamente.
 * - `POST /`: Crea un nuevo producto (requiere autenticación y rol de admin).
 * - `PATCH /:id`: Activa o desactiva la característica de destacado de un producto (requiere autenticación y rol de admin).
 * - `DELETE /:id`: Elimina un producto (requiere autenticación y rol de admin).
 */
const productRoutes = express.Router();

productRoutes.get("/", protectedRoute, adminRoute, getAllProducts);
productRoutes.get("/featured", getFeaturedProducts);
productRoutes.get("/category/:category", getProductsByCategory);
productRoutes.get("/recommendations", getRecommendedProducts);
productRoutes.post("/", protectedRoute, adminRoute, createProduct);
productRoutes.patch("/:id", protectedRoute, adminRoute, toggleFeaturedProduct);
productRoutes.delete("/:id", protectedRoute, adminRoute, deleteProduct);
productRoutes.put("/:id", protectedRoute, adminRoute, updateProduct);

export default productRoutes;
