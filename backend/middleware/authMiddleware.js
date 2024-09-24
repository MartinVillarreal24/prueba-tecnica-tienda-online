import jwt from "jsonwebtoken";
import User from "../models/user.js";

/**
 * Middleware para proteger rutas que requieren autenticación.
 * Verifica la existencia de un token de acceso en las cookies del request.
 * Si el token está presente, intenta decodificarlo para obtener el ID del usuario asociado.
 * Si el token es válido y el usuario existe, se adjunta el usuario a la solicitud (`req.user`)
 * y se llama a `next()` para pasar al siguiente middleware o ruta.
 * Si el token está ausente, ha caducado o es inválido, se envía una respuesta de error 401
 * indicando la razón del fallo en la autenticación.
 */
export const protectedRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "No autorizado - No se proporciona token de acceso" });
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({ message: "Usuario no encontrado" });
      }

      req.user = user;

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "No autorizado: el token de acceso ha caducado" });
      }
      throw error;
    }
  } catch (error) {
    console.log("Error en el middleware protectRoute", error.message);
    return res
      .status(401)
      .json({ message: "No autorizado - token de acceso no válido" });
  }
};

/**
 * Middleware para proteger rutas que requieren privilegios de administrador.
 * Verifica si el usuario autenticado tiene el rol de "admin".
 * Si el usuario es un administrador, se llama a `next()` para permitir el acceso a la ruta.
 * Si el usuario no tiene el rol adecuado, se envía una respuesta de error 403
 * indicando que el acceso está denegado.
 */
export const adminRoute = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Acceso denegado: solo administrador" });
  }
};
