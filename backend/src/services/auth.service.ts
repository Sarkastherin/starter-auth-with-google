import { db } from "../db/db";
import { users, authAccounts } from "../db/schema";
import { and, eq } from "drizzle-orm";
import argon2 from "argon2";

export const findUserByEmail = async (email: string) => {
  const user = await db.select().from(users).where(eq(users.email, email));
  return user.length > 0 ? user[0] : null;
};
export const findUserById = async (id: string) => {
  const user = await db.select().from(users).where(eq(users.id, id));
  return user.length > 0 ? user[0] : null;
};

export const registerUser = async (email: string, password: string) => {
  // 1. 🔎 Validar si el usuario ya existe
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }
  // 2. 🔐 Hashear la contraseña con Argon2
  const passwordHash = await argon2.hash(password);
  // 3. 🔄 Ejecutar las inserciones dentro de una transacción segura
  return await db.transaction(async (tx) => {
    // Insertar en la tabla 'users'
    const [newUser] = await tx
      .insert(users)
      .values({
        email,
      })
      .returning();

    // Insertar en la tabla 'auth_accounts'
    await tx.insert(authAccounts).values({
      userId: newUser.id,
      provider: "local",
      providerAccountId: passwordHash, // Guardamos el hash de la contraseña aquí
    });
    return newUser;
  });
};
export const loginUser = async (email: string, password: string) => {
  // Buscar al usuario por email y traer su hash de contraseña para comparar
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: authAccounts.providerAccountId,
      emailVerified: users.emailVerified,
    })
    .from(users)
    .innerJoin(authAccounts, eq(users.id, authAccounts.userId))
    .where(eq(users.email, email));

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }
  // Verificar la contraseña usando Argon2
  const isPasswordValid = await argon2.verify(user.passwordHash, password);
  if (!isPasswordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // 🟢 Retornar solo los datos públicos del usuario
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
  };
};
export const resetPassword = async (id: string, newPassword: string) => {
  const newPasswordHash = await argon2.hash(newPassword);
  await db
    .update(authAccounts)
    .set({ providerAccountId: newPasswordHash })
    .where(eq(authAccounts.userId, id));
};
export const verifyEmailUser = async (id: string) => {
  await db.update(users).set({ emailVerified: true }).where(eq(users.id, id));
};

export const registerOrLoginGoogleUser = async (googleUser: {
  email: string;
  name: string;
  id: string;
}) => {
  // 1. 🔎 Buscar si el usuario ya existe por email
  let user = await findUserByEmail(googleUser.email);
  if (user) {
    const [existenAccount] = await db
      .select()
      .from(authAccounts)
      .where(
        and(
          eq(authAccounts.userId, user.id),
          eq(authAccounts.provider, "google"),
        ),
      );
    if (!existenAccount) {
      await db.insert(authAccounts).values({
        userId: user.id,
        provider: "google",
        providerAccountId: googleUser.id,
      });
    }
    if (!user.emailVerified) {
      await verifyEmailUser(user.id);
    }
  } else {
    user = await db.transaction(async (tx) => {
      // Insertar en la tabla 'users'
      const [newUser] = await tx
        .insert(users)
        .values({
          email: googleUser.email,
          emailVerified: true,
        })
        .returning();

      await tx.insert(authAccounts).values({
        userId: newUser.id,
        provider: "google",
        providerAccountId: googleUser.id,
      });
      return newUser;
    });
  }
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
  };
};
