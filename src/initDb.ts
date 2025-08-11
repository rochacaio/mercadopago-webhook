import { pool } from "./db";

export async function initDb() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS telegram_users (
      id SERIAL PRIMARY KEY,
      chat_id TEXT UNIQUE NOT NULL,
      name TEXT,
      phone_number TEXT,
      register_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
    console.log("Tabela telegram_users pronta.");
}
