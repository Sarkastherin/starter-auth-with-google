import { pgTable, uuid, varchar, timestamp, boolean, text, unique } from 'drizzle-orm/pg-core';

// 👥 1. Tabla principal de usuarios
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 🔐 2. Tabla de métodos de autenticación
export const authAccounts = pgTable('auth_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // 🔗 Enlace relacional en cascada
  provider: varchar('provider', { length: 50 }).notNull(), // Ej: 'local', 'google'
  providerAccountId: text('provider_account_id').notNull(), // Hash de contraseña o ID de Google
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  // 🛡️ Evita que un mismo proveedor repita la misma cuenta externa
  unique('unique_provider_account').on(table.provider, table.providerAccountId)
]);