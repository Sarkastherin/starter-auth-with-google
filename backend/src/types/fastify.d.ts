import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: string;
      email?: string;
      emailVerified?: boolean;
      name?: string | null;
      givenName?: string | null;
      familyName?: string | null;
      picture?: string | null;
    }; // Los datos que guardamos al firmar
    user: { id: string; email: string; emailVerified: boolean }; // Los datos que recuperamos al verificar
  }
}
