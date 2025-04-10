import { drizzle } from "drizzle-orm/neon-http";
import * as schema1 from "./schema";
import * as schema2 from "./relations";
import { neon } from "@neondatabase/serverless";
import config from "@/lib/config";

const sql = neon(config.env.databaseUrl!);
export const db = drizzle({ client: sql, schema: { ...schema1, ...schema2 } });
