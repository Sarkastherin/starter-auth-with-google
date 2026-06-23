import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  throw new Error("DATABASE_URL is not defined in the environment variables");
}

const pool = new Pool({
  connectionString: DB_URL,
});
export const db = drizzle({ client: pool });
