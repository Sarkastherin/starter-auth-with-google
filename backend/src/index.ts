import "dotenv/config";
import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie"; // 🍪 Importamos el plugin
import { authRoutes } from "./routes/auth.routes";
import fastifyJwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import cors from "@fastify/cors"

const PORT: number = Number(process.env.PORT) || 4000;

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET is not defined in the environment variables");
}
const cookieSecret = process.env.COOKIE_SECRET;
if (!cookieSecret) {
  throw new Error("COOKIE_SECRET is not defined in the environment variables");
}

const fastify = Fastify({
  logger: true, // 📝 Esto nos mostrará todos los logs de las peticiones en la terminal
});

// Registrar el plugin de JWT
fastify.register(fastifyJwt, {
  secret: jwtSecret,
  cookie: {
    cookieName: "identificadorSesion",
    signed: false,
  },
});

// Registrar el plugin de cookies
fastify.register(fastifyCookie, {
  secret: cookieSecret, // Sirve para firmar las cookies y que no las alteren
});
// Registro de limitador de peticiones
fastify.register(rateLimit, {
  global: false,
  errorResponseBuilder: (req, context) => {
    return {
      statusCode: 429,
      error: "Too Many Requests",
      message: `Has excedido el límite de ${context.max} peticiones por ${context.ttl / 1000} segundos.`,
    };
  },
});

// Registrar CORS para permitir solicitudes desde el frontend
fastify.register(cors, {
  origin: "http://localhost:5173", // Cambia esto si tu frontend corre en otro origen
  credentials: true, // Permite enviar cookies en solicitudes CORS
});

fastify.register(authRoutes, { prefix: "/api/auth" }); // Registramos nuestras rutas de autenticación

// Arrancar el servidor
const start = async () => {
  try {
    // Escuchamos en el puerto definido en las variables de entorno o 4000 por defecto
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`--- Servidor corriendo en http://localhost:${PORT} ---`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
