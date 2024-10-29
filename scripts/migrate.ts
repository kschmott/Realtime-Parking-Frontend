import { migrate } from "drizzle-orm/vercel-postgres/migrator";
import { db } from "@/db/db";
import "@/db/config";
async function main() {
  await migrate(db, {
    migrationsFolder: "./drizzle",
  });
}
main();
