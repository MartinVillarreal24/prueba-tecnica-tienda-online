import express from "express";
import { getCoupon, validateCoupon } from "../controllers/coupon.js";
import { protectedRoute } from "../middleware/authMiddleware.js";

/**
 * Rutas para la gestión de cupones de descuento.
 *
 * Estas rutas permiten a los usuarios autenticados obtener su cupón actual
 * y validar un cupón ingresado para verificar su validez y obtener detalles del descuento.
 *
 * - `GET /`: Obtiene el cupón activo del usuario autenticado.
 * - `POST /validate`: Valida un cupón ingresado por el usuario autenticado,
 *   comprobando su existencia, validez y fecha de caducidad.
 */
const couponRoutes = express.Router();

couponRoutes.get("/", protectedRoute, getCoupon);
couponRoutes.post("/validate", protectedRoute, validateCoupon);

export default couponRoutes;
