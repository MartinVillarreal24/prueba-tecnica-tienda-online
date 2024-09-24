import express from "express";
import {
  getProfile,
  login,
  logout,
  refreshToken,
  signup,
} from "../controllers/auth.js";
import { protectedRoute } from "../middleware/authMiddleware.js";

/**
 * Rutas de autenticación para el manejo de usuarios.
 *
 * Estas rutas permiten a los usuarios registrarse, iniciar sesión, cerrar sesión y obtener información de perfil.
 *
 * - `POST /signup`: Registra un nuevo usuario.
 * - `POST /login`: Inicia sesión y devuelve un token de acceso.
 * - `POST /logout`: Cierra sesión del usuario.
 * - `POST /refresh-token`: Renueva el token de acceso utilizando un token de actualización.
 * - `GET /profile`: Obtiene la información del perfil del usuario autenticado.
 *   Requiere un token de acceso válido (middleware `protectedRoute`).
 */
const authRoutes = express.Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);

authRoutes.post("/refresh-token", refreshToken);
authRoutes.get("/profile", protectedRoute, getProfile);

export default authRoutes;
