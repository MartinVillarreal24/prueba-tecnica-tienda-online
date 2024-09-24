import { stripe } from "../lib/stripe.js";
import Coupon from "../models/coupon.js";
import Order from "../models/order.js";

/**
 * Crea una sesión de pago para el proceso de compra.
 * Valida la matriz de productos recibida y calcula el monto total a pagar.
 * Si se proporciona un código de cupón, valida el cupón y aplica el descuento correspondiente.
 * Crea una sesión de pago en Stripe y responde con el ID de la sesión y el monto total.
 * Si el monto total supera un umbral específico, se genera un nuevo cupón para el usuario.
 * Responde con un mensaje de error y un estado 500 si ocurre algún problema durante el proceso.
 */
export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ error: "Matriz de productos no válida o vacía" });
    }

    let totalAmount = 0;

    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); // stripe quiere siempre que se envie en formato de centavos
      totalAmount += amount * product.quantity;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1,
      };
    });

    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });
      if (coupon) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon
        ? [
            {
              coupon: await createStripeCoupon(coupon.discountPercentage),
            },
          ]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    });

    if (totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }
    res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
  } catch (error) {
    console.error("Error al procesar el pago:", error);
    res
      .status(500)
      .json({ message: "Error al procesar el pago", error: error.message });
  }
};

/**
 * Maneja el procesamiento del pago exitoso tras una sesión de pago de Stripe.
 * Recupera la sesión de pago usando el ID de sesión proporcionado y verifica su estado.
 * Si el pago fue exitoso, desactiva el cupón asociado (si existe) y crea un nuevo pedido en la base de datos.
 * Responde con un mensaje de éxito y el ID del nuevo pedido.
 * Responde con un mensaje de error y un estado 500 si ocurre algún problema durante el procesamiento.
 */
export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: session.metadata.couponCode,
            userId: session.metadata.userId,
          },
          {
            isActive: false,
          }
        );
      }

      // crear un nuevo pedido
      const products = JSON.parse(session.metadata.products);
      const newOrder = new Order({
        user: session.metadata.userId,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: session.amount_total / 100, // convertir de centavos a dólares
        stripeSessionId: sessionId,
      });

      await newOrder.save();

      res.status(200).json({
        success: true,
        message: "Pago exitoso, pedido creado y cupón desactivado si se usa.",
        orderId: newOrder._id,
      });
    }
  } catch (error) {
    console.error("Error al procesar el pago exitoso:", error);
    res.status(500).json({
      message: "Error al procesar el pago exitoso",
      error: error.message,
    });
  }
};

/**
 * Crea un cupón en Stripe con un porcentaje de descuento especificado.
 * El cupón se configura para aplicarse una sola vez.
 * Devuelve el ID del cupón creado en Stripe.
 *
 * @param {number} discountPercentage - El porcentaje de descuento que el cupón proporcionará.
 * @returns {Promise<string>} - ID del cupón creado en Stripe.
 */
async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });

  return coupon.id;
}

/**
 * Crea un nuevo cupón para un usuario específico.
 * Primero, elimina cualquier cupón existente asociado al usuario.
 * Genera un nuevo código de cupón aleatorio que comienza con "GIFT" y tiene un descuento del 10%.
 * Establece la fecha de expiración del cupón a 30 días a partir de la creación.
 * Guarda el nuevo cupón en la base de datos y lo devuelve.
 *
 * @param {string} userId - ID del usuario al que se le asignará el nuevo cupón.
 * @returns {Promise<Coupon>} - El nuevo cupón creado y guardado en la base de datos.
 */
async function createNewCoupon(userId) {
  await Coupon.findOneAndDelete({ userId });

  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // dentro de 30 días
    userId: userId,
  });

  await newCoupon.save();

  return newCoupon;
}
