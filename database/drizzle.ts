import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema1 from "./schema";
import * as schema2 from "./relations";
import { neon, Pool } from "@neondatabase/serverless";
import config from "@/lib/config";

const sql = neon(config.env.databaseUrl!);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle({ client: pool, schema: { ...schema1, ...schema2 } });
