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
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // ✨ YEH LINE ADD KAREIN: 
    // Ye line model check karegi aur boards table bana degi
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced & Tables created");

  } catch (error) {
    console.error("❌ DB connection failed:", error);
  }
};

export default sequelize;