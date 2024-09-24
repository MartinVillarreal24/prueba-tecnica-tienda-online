import Coupon from "../models/coupon.js";

/**
 * Obtiene un cupón activo asociado al usuario autenticado.
 * Busca en la base de datos un cupón que pertenezca al usuario y que esté activo.
 * Responde con el cupón encontrado o null si no hay ningún cupón activo.
 * Responde con un mensaje de error y un estado 500 si ocurre algún problema.
 */
export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });
    res.json(coupon || null);
  } catch (error) {
    console.log("Error en el controlador getCoupon", error.message);
    res
      .status(500)
      .json({ message: "error del servidor", error: error.message });
  }
};

/**
 * Valida un cupón ingresado por el usuario autenticado.
 * Busca un cupón activo y asociado al usuario en la base de datos.
 * Si el cupón no existe, responde con un mensaje de error 404.
 * Si el cupón ha caducado, lo marca como inactivo y responde con un mensaje de cupón caducado.
 * Si el cupón es válido, responde con un mensaje de éxito y detalles del descuento.
 * Responde con un mensaje de error y un estado 500 si ocurre algún problema.
 */
export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({
      code: code,
      userId: req.user._id,
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({ message: "Cupón no encontrado" });
    }

    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(404).json({ message: "Cupón caducado" });
    }

    res.json({
      message: "El cupón es válido",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (error) {
    console.log(
      "Error en el controlador de validación de cupón",
      error.message
    );
    res
      .status(500)
      .json({ message: "error del servidor", error: error.message });
  }
};
