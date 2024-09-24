import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";
import User from "../models/user.js";

// Función que genera un token de acceso y un token de actualización para un usuario dado.
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// Funcion que Almacena un token de actualización en Redis asociado a un usuario específico por 7 días.
const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  ); // 7 dias
};

// Funcion que establece las cookies de acceso y actualización en la respuesta con medidas de seguridad como httpOnly, sameSite, y expiración.
const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevenir ataques XSS, ataques de scripts entre sitios
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // previene el ataque CSRF y el ataque de falsificación de solicitudes entre sitios
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // // prevenir ataques XSS, ataques de scripts entre sitios
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // previene el ataque CSRF y el ataque de falsificación de solicitudes entre sitios
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

/**
 * Registra un nuevo usuario, genera tokens de acceso y actualización, y establece cookies para la autenticación.
 * Si el usuario ya existe, retorna un error 400. Si hay éxito, responde con los detalles del usuario creado.
 */
export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }
    const user = await User.create({ name, email, password });

    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.log("Error en el controlador de registro", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Autentica a un usuario, genera tokens de acceso y actualización, y establece cookies para la sesión.
 * Si el correo o la contraseña son inválidos, retorna un error 400. Si hay éxito, responde con los detalles del usuario.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user._id);
      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res
        .status(400)
        .json({ message: "Correo electrónico o contraseña no válidos" });
    }
  } catch (error) {
    console.log("Error en el controlador de inicio de sesión", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Maneja el proceso de cierre de sesión de un usuario.
 * Elimina el token de refresco del almacenamiento (Redis) y borra las cookies de acceso y refresco.
 * Responde con un mensaje de éxito o un error si ocurre algún problema.
 */
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refresh_token:${decoded.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Cerró sesión exitosamente" });
  } catch (error) {
    console.log("Error en el controlador de cierre de sesión", error.message);
    res
      .status(500)
      .json({ message: "error del servidor", error: error.message });
  }
};

/**
 * Maneja el proceso de actualización del token de acceso utilizando el token de refresco.
 * Verifica la validez del token de refresco proporcionado, asegurándose de que coincide
 * con el token almacenado en Redis. Si es válido, genera un nuevo token de acceso
 * y lo envía como una cookie al cliente.
 * Responde con un mensaje de éxito o un error si ocurre algún problema.
 */
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: "No se proporciona ningún token de actualización" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return res
        .status(401)
        .json({ message: "Token de actualización no válido" });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Token actualizado con éxito" });
  } catch (error) {
    console.log(
      "Error en el controlador de actualización de token",
      error.message
    );
    res
      .status(500)
      .json({ message: "error del servidor", error: error.message });
  }
};

/**
 * Devuelve la información del perfil del usuario autenticado.
 * Responde con los datos del usuario si la solicitud es exitosa.
 * Si ocurre un error, responde con un mensaje de error y un estado 500.
 */
export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "error del servidor", error: error.message });
  }
};
