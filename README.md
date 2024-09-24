# Guia Prueba Tecnica

## Tecnologias usadas

### Backend

#### El codigo esta muy bien comentado para su completo entendimiento y se explica para que se usa cada funcion perfectamente

- Node.js con javascript
- Express.js
- MongoDB como base de datos
- Redis como base de datos para almacenar los refresh tokens y informacion que se pueda guardar en cache
- Cloudinary como contenedor para las imagenes
- Stripe para implementar una pasarela de pagos
- bcryptjs para la encriptacion de contraseñas

### Frontend

#### El codigo esta hecho de una manera entendible para personas que no se hayan acercado mucho a react y la interfaz es super intuitiva y minimalista con animaciones y una experiencia de usuario muy bien lograda

- React.js para el frontend usando javascript y vite
- React Router Dom para el enrutado
- Tailwind Css para estilos
- Stripe para el frontend de la pasarela de pagos
- Framer motion para algunas animaciones y diseño minimalista
- Zustand para el manejo del estado de la aplicacion
- Axios para realizar las peticiones al backend

### Explicacion del uso de las tecnologias

Opte por un stack de tecnologias robusto y ampliamente utilizado en la industria para garantizar que los desarrollos sean eficientes y escalables.

El frontend fue diseñado para ser accesible y atractivo, con un enfoque en la experiencia del usuario:

- Node.js con JavaScript: Elegí Node.js por su capacidad para manejar múltiples conexiones simultáneas de manera eficiente, lo que es ideal para aplicaciones en tiempo real. JavaScript permite un desarrollo fluido en todo el stack, lo que me facilito mucho la colaboración entre frontend y backend.

- Express.js: Esta biblioteca proporciona una estructura simple y flexible para crear APIs, lo que me permitio definir rutas y middleware de forma sencilla.Es muy minimalista y eso es perfecto para desarrollar rápidamente una API RESTful.

- MongoDB como base de datos: Opté por MongoDB debido a su flexibilidad y escalabilidad, así como su capacidad para manejar datos no estructurados. Esto es fundamental para una tienda en línea, donde los productos y la información del usuario pueden variar ampliamente.

- Redis para almacenar refresh tokens y caché: Elegí Redis por su alta velocidad y eficiencia en la gestión de datos temporales. Almacenar refresh tokens en Redis mejora la seguridad y el rendimiento, permitiendo un acceso rápido y eficiente a la información de autenticación.

- Cloudinary como contenedor de imágenes: Utilicé Cloudinary para facilitar la gestión y entrega de imágenes de manera eficiente. Su capacidad para optimizar imágenes y generar diferentes tamaños de manera dinámica mejora la experiencia del usuario y reduce el tiempo de carga.

- Stripe para la pasarela de pagos: Stripe es una de las soluciones de pago más confiables y fáciles de implementar. Su API proporciona una experiencia de pago fluida y segura, lo cual es esencial para la confianza del cliente en una tienda en línea.

- bcryptjs para la encriptación de contraseñas: La seguridad es primordial, por lo que utilicé bcryptjs para asegurar las contraseñas de los usuarios. Este enfoque garantiza que la información sensible esté protegida contra accesos no autorizados.

- React.js usando JavaScript y Vite: Elegí React.js por su popularidad y su enfoque basado en componentes, lo que facilita la creación de interfaces de usuario interactivas y reutilizables. Vite mejora el tiempo de desarrollo y ofrece un entorno de trabajo más rápido.

- React Router Dom para el enrutado: Utilicé React Router para gestionar la navegación de la aplicación de forma sencilla y eficiente, permitiendo a los usuarios navegar sin recargar la página, lo que mejora la experiencia general.

- Tailwind CSS para estilos: Tailwind CSS siempre me permite implementar un diseño atractivo y minimalista de manera rápida y eficiente, utilizando clases de utilidad. Esto contribuye a un desarrollo más rápido y a una mayor consistencia visual.

- Stripe para el frontend de la pasarela de pagos: Utilizar Stripe en el frontend garantiza que la experiencia de pago sea fluida y coherente con el backend, ofreciendo una interfaz clara y segura para los usuarios.

- Framer Motion para animaciones: Elegí Framer Motion para agregar animaciones suaves y modernas, mejorando la interacción del usuario y aportando un diseño minimalista que mantiene la atención en el contenido principal.

- Zustand para el manejo del estado: Zustand es una solución simple y eficiente para manejar el estado global de la aplicación. Su facilidad de uso permite gestionar el estado de manera efectiva sin añadir complejidad innecesaria.

- Axios para realizar peticiones al backend: Utilicé Axios por su simplicidad y eficiencia en la gestión de solicitudes HTTP, lo que facilita la interacción entre el frontend y el backend de manera segura y efectiva.

## Puntos a resaltar

### 1. Login con Identificación de Usuario

Se desarrollo un completo sistema de autorizacion y autenticacion basado en JWT, usando refresh tokens tambien para generar de nuevo los tokens una vez vencidos. El sistema identifica entre un usuario normal que seria un cliente y un administrador que seria el dueño de la tienda

### 2. Funcionalidades del Administrador

La creacion de usuarios por parte del administrador no la vi conveniente para esta prueba tecnica dado que no se especificaba si se tenia que realizar un sistema con varias sedes, por lo cual no lo vi necesario, para este reto en concreto desarrolle la tienda pensando en un usuario administrador y usuarios clientes, la funcionalidad de crear un usuario por parte del admin era innecesaria para este caso.

El CRUD completo del administrador con los productos funciona, en la parte del frontend la unica funcionalidad del crud que no me alcanzo para implementar fue el Update, pero en el backend si funciona.

De igual manera la parte de poder ver todas las compras de los usuarios, no alcance a implementarla pero agregue algunas funcionalidades extras que ayudaban a que la prueba tuviera un poco mas de sentido

La parte de ver el historial de los productos creados funciona perfectamente

### 3. Funcionalidades del Cliente

El cliente puede realizar todas las funcionalidades excepto la de ver su historial de compras realizadas, la cual solo puede observarse desde la base de datos y los registros de Stripe

## Explicacion de como funciona

El sistema por seguridad solo cuenta con un usuario administrador

- prueba@gmail.com
- 123456

Se pueden crear mas usuarios administradores solo actualizando el schema desde la base de datos

los demas usuarios que se registren por defecto seran clientes y solo tendras algunas opciones habilitades, el administrador tendra su propio panel

Las variables de entorno estaran adjuntas en el correo electronico, puede cambiar la uri de la base de datos por una propia, solo no se olvide de permitir el acceso a cualquier ip para efectos practicos

los pagos funcionan con Stripe, esta perfectamente integrado

## En mongoDB no se usan diagramas entidad relacion sino con esquemas en los cuales se realizan las relaciones. Estos esquemas los adjuntare en el correo electronico
