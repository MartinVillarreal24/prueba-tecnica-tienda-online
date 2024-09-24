import cloudinary from "../lib/cloudinary.js";
import { redis } from "../lib/redis.js";
import Product from "../models/product.js";

/**
 * Recupera todos los productos de la base de datos.
 * Envía una respuesta JSON que contiene una lista de todos los productos disponibles.
 * Responde con un mensaje de error y un estado 500 si ocurre algún problema durante la recuperación.
 */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}); // encontrar todos los productos
    res.json({ products });
  } catch (error) {
    console.log("Error en el controlador getAllProducts", error.message);
    res
      .status(500)
      .json({ message: "error del servidor", error: error.message });
  }
};

/**
 * Recupera los productos destacados, primero intentando obtenerlos de Redis.
 * Si los productos no están en Redis, los busca en MongoDB.
 * Utiliza .lean() para mejorar el rendimiento al devolver documentos simples de JavaScript.
 * Si se encuentran productos destacados, se almacenan en Redis para acceso rápido en futuras solicitudes.
 * Responde con los productos destacados en formato JSON o con un mensaje de error si no se encuentran.
 *
 */
export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }

    // si no está en redis, se busca desde mongodb
    // .lean() devolverá un objeto javascript simple en lugar de un documento mongodb
    // lo cual es bueno para el rendimiento
    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts) {
      return res
        .status(404)
        .json({ message: "No se encontraron productos destacados" });
    }

    // almacenar en redis para un acceso rápido en el futuro

    await redis.set("featured_products", JSON.stringify(featuredProducts));

    res.json(featuredProducts);
  } catch (error) {
    console.log("Error en el controlador getFeaturedProducts", error.message);
    res
      .status(500)
      .json({ message: "error del servidor", error: error.message });
  }
};

/**
 * Crea un nuevo producto en la base de datos.
 * Extrae los detalles del producto del cuerpo de la solicitud (nombre, descripción, precio, imagen y categoría).
 * Si se proporciona una imagen, la sube a Cloudinary y utiliza la URL segura para el producto.
 * Guarda el nuevo producto en la base de datos y responde con el producto creado.
 * Si ocurre un error, se registra y se devuelve un mensaje de error con el estado 500.
 *
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
    });

    res.status(201).json(product);
  } catch (error) {
    console.log("Error en el controlador createProduct", error.message);
    res
      .status(500)
      .json({ message: "error del servidor", error: error.message });
  }
};

/**
 * Elimina un producto de la base de datos y, si corresponde, su imagen de Cloudinary.
 * Busca el producto por su ID proporcionado en los parámetros de la solicitud.
 * Si el producto no se encuentra, responde con un mensaje de error y un estado 404.
 * Si el producto tiene una imagen, la elimina de Cloudinary utilizando su ID público.
 * Luego, elimina el producto de la base de datos y responde con un mensaje de éxito.
 * Si ocurre un error, se registra y se devuelve un mensaje de error con el estado 500.
 *
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("imagen eliminada de cloduinary");
      } catch (error) {
        console.log("error al eliminar la imagen de cloduinary", error);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.log("Error al eliminar el controlador de producto", error.message);
    res
      .status(500)
      .json({ message: "error del servidor", error: error.message });
  }
};

/**
 * Actualiza un producto existente en la base de datos.
 *
 * Busca el producto por su ID utilizando `Product.findById`.
 * Si no se encuentra el producto, devuelve un error 404 con un mensaje.
 * Si se proporciona una nueva imagen en la solicitud:
 * - Elimina la imagen anterior de Cloudinary si existe.
 * - Sube la nueva imagen a Cloudinary y actualiza la URL en el cuerpo de la solicitud.
 * Actualiza el producto con los nuevos datos utilizando `Product.findByIdAndUpdate`.
 * Devuelve una respuesta JSON con un mensaje de éxito y los datos del producto actualizado.
 * Maneja posibles errores y devuelve un mensaje de error 500 en caso de que ocurra una excepción.
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Si se proporciona una nueva imagen, elimina la imagen anterior de Cloudinary
    if (req.body.image) {
      if (product.image) {
        const publicId = product.image.split("/").pop().split(".")[0];
        try {
          await cloudinary.uploader.destroy(`products/${publicId}`);
          console.log("Imagen eliminada de Cloudinary");
        } catch (error) {
          console.log("Error al eliminar la imagen de Cloudinary", error);
        }
      }

      // Sube la nueva imagen a Cloudinary
      const result = await cloudinary.uploader.upload(req.body.image, {
        folder: "products",
      });
      req.body.image = result.secure_url; // Actualiza la URL de la imagen en el cuerpo de la solicitud
    }

    // Actualiza el producto con los nuevos datos
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      message: "Producto actualizado exitosamente",
      product: updatedProduct,
    });
  } catch (error) {
    console.log("Error al actualizar el producto", error.message);
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
};

/**
 * Obtiene un conjunto aleatorio de productos recomendados de la base de datos.
 * Utiliza la agregación de MongoDB para seleccionar aleatoriamente 4 productos
 * y proyecta solo los campos necesarios (id, nombre, descripción, imagen y precio).
 * Responde con la lista de productos recomendados.
 * Si ocurre un error durante la consulta, se registra y se devuelve un mensaje de error con el estado 500.
 *
 */
export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 4 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    console.log(
      "Error en el controlador getRecommendedProducts",
      error.message
    );
    res
      .status(500)
      .json({ message: "error del servidor", error: error.message });
  }
};

/**
 * Obtiene todos los productos de una categoría específica.
 * Busca productos en la base de datos que coincidan con la categoría proporcionada
 * en los parámetros de la solicitud. Responde con la lista de productos encontrados.
 * Si ocurre un error durante la consulta, se registra y se devuelve un mensaje de error con el estado 500.
 *
 */
export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    res.json({ products });
  } catch (error) {
    console.log("Error en el controlador getProductsByCategory", error.message);
    res
      .status(500)
      .json({ message: "error del servidor", error: error.message });
  }
};

/**
 * Cambia el estado de un producto destacado (featured) en la base de datos.
 * Busca un producto por su ID, invierte su propiedad `isFeatured` y lo guarda.
 * Después de actualizar el producto, también actualiza la caché de productos destacados.
 * Si el producto no se encuentra, responde con un estado 404 y un mensaje de error.
 * Si ocurre un error durante el proceso, se registra y se devuelve un mensaje de error con el estado 500.
 *
 */
export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductsCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Producto no encontrado" });
    }
  } catch (error) {
    console.log("Error en el controlador toggleFeaturedProduct", error.message);
    res
      .status(500)
      .json({ message: "error del servidor", error: error.message });
  }
};

/**
 * Actualiza la caché de productos destacados en Redis.
 * Obtiene todos los productos que están marcados como destacados (`isFeatured: true`)
 * de la base de datos y los almacena en Redis para un acceso rápido en futuras solicitudes.
 * Utiliza el método `lean()` para devolver objetos JavaScript simples, lo que mejora el rendimiento.
 * Si ocurre un error durante el proceso, se registra un mensaje de error en la consola.
 */
async function updateFeaturedProductsCache() {
  try {
    // El método lean() se utiliza para devolver objetos JavaScript simples en lugar de documentos Mongoose completos. Esto puede mejorar significativamente el rendimiento.

    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("error en la función de actualización de caché");
  }
}
