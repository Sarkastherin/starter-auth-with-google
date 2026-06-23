import { FastifyReply, FastifyRequest } from 'fastify';

export async function checkAuth(request: FastifyRequest, reply: FastifyReply) {
  // 1. 🍪 Extraemos el token de la cookie usando su nombre
  const token = request.cookies.identificadorSesion;

  // 2. 🛑 Si la cookie no existe, rebotamos la petición de inmediato
  if (!token) {
    return reply.status(401).send({
      error: 'No autorizado',
      message: 'Inicia sesión para acceder a este recurso.'
    });
  }

  try {
    // 3. 🪙 Verificamos el JWT
    // Al usar await, Fastify decodifica el token, valida la firma y 
    // guarda automáticamente el payload dentro de `request.user`
    await request.jwtVerify();
  } catch (error) {
    // 💥 Si el token expiró o fue manipulado, respondemos con 401
    return reply.status(401).send({
      error: 'No autorizado',
      message: 'Tu sesión ha expirado o no es válida.'
    });
  }
}