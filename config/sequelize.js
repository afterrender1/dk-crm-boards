import "server-only";
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || "devskarnel_crm",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "root",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
  }
);

// 🔥 Test connection AND Sync tables
// lib/db.js
let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return; // Skip if already connected

  try {
    await sequelize.authenticate();
    isConnected = true;
    console.log("✅ Database connected successfully");

    // REMOVE sequelize.sync({ alter: true }) FROM HERE
  } catch (error) {
    console.error("❌ DB connection failed:", error);
  }
};

export default sequelize;