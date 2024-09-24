import Order from "../models/order.js";
import Product from "../models/product.js";
import User from "../models/user.js";

// Funcion para obtener los datos analíticos del sistema
export const getAnalyticsData = async () => {
  // Se obtiene el total de usuarios y productos registrados en la base de datos
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();

  // Se realiza una consulta agregada a la colección de órdenes para calcular el total de ventas y el ingreso total
  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null, // para agrupar todos los documentos
        totalSales: { $sum: 1 }, // Cuenta el número total de ventas
        totalRevenue: { $sum: "$totalAmount" }, // Suma el valor total de la columna "totalAmount" para calcular los ingresos
      },
    },
  ]);

  // Se Desestructuran los valores de totalSales y totalRevenue del resultado de salesData
  // Si no hay resultados, se asigna 0 tanto a totalSales como a totalRevenue
  const { totalSales, totalRevenue } = salesData[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };

  //Se Retorna un objeto que contiene los datos calculados: usuarios totales, productos totales, ventas totales y los ingresos totales
  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue,
  };
};

// Función que devuelve los datos de ventas y de ingresos por día dentro del rango especificado.
export const getDailySalesData = async (startDate, endDate) => {
  try {
    // Se Realiza una consulta agregada en la colección de órdenes para obtener las ventas diarias y el ingreso total por día.
    const dailySalesData = await Order.aggregate([
      {
        //Se Filtran las órdenes cuyos campos 'createdAt' estén entre 'startDate' y 'endDate'
        $match: {
          createdAt: {
            $gte: startDate, // Mayor o igual que la fecha de inicio
            $lte: endDate, // Menor o igual que la fecha de fin
          },
        },
      },
      {
        //Se Agrupan las órdenes por fecha, formateando la fecha en el formato "YYYY-MM-DD"
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Agrupa por fecha
          sales: { $sum: 1 }, // Cuenta la cantidad de ventas por día
          revenue: { $sum: "$totalAmount" }, // Suma el total de ingresos por día
        },
      },
      // Ordena los resultados por fecha ascendente (de más antiguo a más reciente)
      { $sort: { _id: 1 } },
    ]);

    // Ejemplo de cómo se verían los datos devueltos por 'dailySalesData':
    // [
    // 	{
    // 		_id: "2024-08-18",  // Fecha del día
    // 		sales: 12,          // Ventas totales del día
    // 		revenue: 1450.75    // Ingreso total del día
    // 	},
    // ]

    //Se Obtiene un arreglo de todas las fechas dentro del rango especificado (incluyendo días sin ventas).
    const dateArray = getDatesInRange(startDate, endDate);
    // Ejemplo de dateArray: ['2024-08-18', '2024-08-19', ...]

    //Se Mapea cada fecha en el rango y busca los datos correspondientes en dailySalesData.
    // Si no se encuentran datos para una fecha, se devuelve 0 en ventas y 0 en ingresos para ese día.
    return dateArray.map((date) => {
      const foundData = dailySalesData.find((item) => item._id === date); // Se Busca si hay datos para la fecha actual.

      return {
        date, // La fecha actual
        sales: foundData?.sales || 0, // Ventas del día (0 si no hay datos)
        revenue: foundData?.revenue || 0, // Ingresos del día (0 si no hay datos)
      };
    });
  } catch (error) {
    // Si ocurre algún error durante el proceso, se lanza una excepción para que sea manejada externamente.
    throw error;
  }
};

// Función que genera un arreglo de fechas desde 'startDate' hasta 'endDate'.
function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  // Bucle que se ejecuta mientras la fecha actual sea menor o igual que la fecha de fin.
  while (currentDate <= endDate) {
    //Se Convierte la fecha actual en formato ISO (YYYY-MM-DD) y la agrega al arreglo de fechas.
    // La función 'split("T")[0]' se usa para extraer solo la parte de la fecha, eliminando la hora.
    dates.push(currentDate.toISOString().split("T")[0]);

    //Se Incrementa la fecha actual en 1 día.
    currentDate.setDate(currentDate.getDate() + 1);
  }

  //Se Devuelve el arreglo con todas las fechas desde 'startDate' hasta 'endDate'.
  return dates;
}
