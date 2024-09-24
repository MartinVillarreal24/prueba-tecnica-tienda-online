import Product from "../models/product.js";

/**
 * Obtiene los productos del carrito del usuario autenticado.
 * Busca los productos en la base de datos utilizando los IDs almacenados en el carrito del usuario.
 * Agrega la cantidad correspondiente a cada producto en el carrito y devuelve la lista de productos.
 * Responde con un mensaje de error y un estado 500 si ocurre algún problema.
 */
export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } });

    // agregar cantidad para cada producto
    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.id === product.id
      );
      return { ...product.toJSON(), quantity: item.quantity };
    });

    res.json(cartItems);
  } catch (error) {
    console.log("Error en el controlador getCartProducts", error.message);
    res
      .status(500)
      .json({ message: "error del servidor", error: error.message });
  }
};

/**
 * Agrega un producto al carrito del usuario autenticado.
 * Si el producto ya existe en el carrito, incrementa su cantidad en uno.
 * Si no, añade el producto al carrito. Luego, guarda los cambios en el usuario.
 * Responde con la lista actualizada de artículos en el carrito o un mensaje de error si ocurre algún problema.
 */
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }

    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    console.log("Error en el controlador addToCart", error.message);
    res
      .status(500)
      .json({ message: "error del servidor", error: error.message });
  }
};

/**
 * Elimina un producto específico del carrito del usuario autenticado.
 * Si no se proporciona un ID de producto, vacía el carrito por completo.
 * Guarda los cambios en el usuario y responde con la lista actualizada de artículos en el carrito.
 * Responde con un mensaje de error y un estado 500 si ocurre algún problema.
 */
export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    }
    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    res
      .status(500)
      .json({ message: "error en el servidor", error: error.message });
  }
};

/**
 * Actualiza la cantidad de un producto en el carrito del usuario autenticado.
 * Si la cantidad se establece en cero, elimina el producto del carrito.
 * Guarda los cambios en el usuario y responde con la lista actualizada de artículos en el carrito.
 * Si el producto no se encuentra en el carrito, responde con un mensaje de error 404.
 * Responde con un mensaje de error y un estado 500 si ocurre algún problema.
 */
export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find((item) => item.id === productId);

    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        await user.save();
        return res.json(user.cartItems);
      }

      existingItem.quantity = quantity;
      await user.save();
      res.json(user.cartItems);
    } else {
      res.status(404).json({ message: "Producto no encontrado" });
    }
  } catch (error) {
    console.log("Error en el controlador updateQuantity", error.message);
    res
      .status(500)
      .json({ message: "error en el servidor", error: error.message });
  }
};
