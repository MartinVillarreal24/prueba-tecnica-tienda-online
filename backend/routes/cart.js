import express from "express";
import {
  addToCart,
  getCartProducts,
  removeAllFromCart,
  updateQuantity,
} from "../controllers/cart.js";
import { protectedRoute } from "../middleware/authMiddleware.js";

/**
 * Rutas para la gestión del carrito de compras.
 *
 * Estas rutas permiten a los usuarios interactuar con su carrito de compras,
 * incluyendo la obtención de productos, la adición de nuevos productos,
 * la eliminación de todos los productos y la actualización de la cantidad de un producto específico.
 *
 * - `GET /`: Obtiene los productos del carrito del usuario autenticado.
 * - `POST /`: Agrega un producto al carrito del usuario autenticado.
 * - `DELETE /`: Elimina todos los productos del carrito del usuario autenticado.
 * - `PUT /:id`: Actualiza la cantidad de un producto específico en el carrito del usuario autenticado.
 */
const cartRoutes = express.Router();

cartRoutes.get("/", protectedRoute, getCartProducts);
cartRoutes.post("/", protectedRoute, addToCart);
cartRoutes.delete("/", protectedRoute, removeAllFromCart);
cartRoutes.put("/:id", protectedRoute, updateQuantity);

export default cartRoutes;
