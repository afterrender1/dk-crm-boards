import "server-only";
import { DataTypes } from "sequelize";
import sequelize from "@/config/sequelize";

const Client = sequelize.define("Client", {
    client_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    full_name: DataTypes.STRING,
    email: DataTypes.STRING,
    gender: DataTypes.STRING,
    status: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    company_name: DataTypes.STRING,
    website_url: DataTypes.STRING,
    country: DataTypes.STRING,
    state: DataTypes.STRING,
    city: DataTypes.STRING,
    lead_source: DataTypes.STRING,
    lead_stage: DataTypes.STRING,
    profile_image_url: DataTypes.TEXT,
}, {
    tableName: "clients_data",

    // FIX: In 3 lines ko update karein
    timestamps: true,        // Enable timestamps
    underscored: true,      // Tells Sequelize to use created_at instead of createdAt
    createdAt: "created_at", // Explicitly mapping (Safest way)
    updatedAt: "updated_at"  // Explicitly mapping
});

export default Client;