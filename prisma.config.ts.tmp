import 'dotenv/config'; // Add this at the top
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // Update this path to point to your actual schema from the root
  schema: "apps/api/prisma/schema.prisma",
  migrations: {
    path: "apps/api/prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});