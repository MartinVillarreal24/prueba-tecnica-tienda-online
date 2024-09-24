import express from "express";
import {
  checkoutSuccess,
  createCheckoutSession,
} from "../controllers/payment.js";
import { protectedRoute } from "../middleware/authMiddleware.js";

/**
 * Rutas para gestionar el proceso de pago.
 *
 * Estas rutas permiten a los usuarios autenticados crear una sesión de pago
 * y manejar el éxito de la transacción una vez completada.
 *
 * - `POST /create-checkout-session`: Crea una sesión de pago en Stripe
 *   para los productos en el carrito y, opcionalmente, aplica un cupón de descuento.
 * - `POST /checkout-success`: Maneja la confirmación del pago exitoso,
 *   desactivando el cupón utilizado y creando un nuevo pedido en la base de datos.
 */
const paymentRoutes = express.Router();

paymentRoutes.post(
  "/create-checkout-session",
  protectedRoute,
  createCheckoutSession
);
paymentRoutes.post("/checkout-success", protectedRoute, checkoutSuccess);

export default paymentRoutes;
