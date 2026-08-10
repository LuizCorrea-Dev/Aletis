const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://aletis:aletis_secret_pass@localhost:5432/aletis_db";

  console.log("Connecting to PostgreSQL at:", connectionString);
  const pool = new Pool({ connectionString });

  try {
    const sqlPath = path.join(__dirname, "init-local-db.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");
    console.log("Executing init-local-db.sql script...");
    await pool.query(sql);
    console.log("Migration executed successfully!");
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
