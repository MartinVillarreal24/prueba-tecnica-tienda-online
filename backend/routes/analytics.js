import express from "express";
import {
  getAnalyticsData,
  getDailySalesData,
} from "../controllers/analytics.js";
import { adminRoute, protectedRoute } from "../middleware/authMiddleware.js";

/**
 * Ruta para obtener datos analíticos.
 *
 * Esta ruta es protegida y solo accesible para administradores.
 * Recupera datos analíticos y ventas diarias para los últimos 7 días.
 *
 * - Se utiliza el middleware `protectedRoute` para verificar el token de acceso.
 * - Se utiliza el middleware `adminRoute` para asegurar que solo los administradores puedan acceder.
 *
 * Responde con un objeto JSON que contiene:
 * - `analyticsData`: datos analíticos generales.
 * - `dailySalesData`: datos de ventas diarias de los últimos 7 días.
 */
const analyticsRoutes = express.Router();

analyticsRoutes.get("/", protectedRoute, adminRoute, async (req, res) => {
  try {
    const analyticsData = await getAnalyticsData();

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dailySalesData = await getDailySalesData(startDate, endDate);

    res.json({
      analyticsData,
      dailySalesData,
    });
  } catch (error) {
    console.log("Error en la ruta de análisis", error.message);
    res
      .status(500)
      .json({ message: "error del servidor", error: error.message });
  }
});

export default analyticsRoutes;
