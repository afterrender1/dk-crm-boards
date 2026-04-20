import Client from "./Client";
import ClientNote from "./ClientNote";
import Project from "./Project";

// 1. Define Relations (Both ways)
Client.hasMany(Project, { foreignKey: "client_id" });
Project.belongsTo(Client, { foreignKey: "client_id" }); // <--- Yeh important hai include ke liye

Client.hasMany(ClientNote, { foreignKey: "client_id" });
ClientNote.belongsTo(Client, { foreignKey: "client_id" });

// 2. Export everything
export { Client, ClientNote, Project };