import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "singlestore",
  tablesFilter: ["drive-clone_*"],
  dbCredentials: {
    host: env.SINGLESTORE_DATABASE_HOST,
    port: parseInt(env.SINGLESTORE_DATABASE_PORT),
    user: env.SINGLESTORE_DATABASE_USERNAME,
    password: env.SINGLESTORE_DATABASE_PASSWORD,
    database: env.SINGLESTORE_DATABASE_NAME,
    ssl: {},
  }
} satisfies Config;
