import { Pool } from "pg";

export const pool = new Pool({
    user: process.env.DB_USER || "mpuser",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "mpdb",
    password: process.env.DB_PASS || "mpsenha",
    port: Number(process.env.DB_PORT) || 5432,
});
