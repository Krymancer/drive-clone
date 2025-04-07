import { drizzle } from "drizzle-orm/singlestore";
import { createPool, type Pool } from "mysql2/promise";

import { env } from "~/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  connection: Pool | undefined;
};

export const connection =
  globalForDb.connection ??
  createPool({
    host: env.SINGLESTORE_DATABASE_HOST,
    user: env.SINGLESTORE_DATABASE_USERNAME,
    password: env.SINGLESTORE_DATABASE_PASSWORD,
    database: env.SINGLESTORE_DATABASE_NAME,
    ssl: {},
  });
if (env.NODE_ENV !== "production") globalForDb.connection = connection;

connection.addListener("error", (err) => {
  console.error("Database connection error:", err);
});

export const db = drizzle(connection, { schema });
