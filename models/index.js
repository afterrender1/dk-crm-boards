import Client from "./Client";
import ClientNote from "./ClientNote";
import Project from "./Project";
import List from "./List";
import Board from "./Board";
// import Card from "./Card"; // Card model ko bhi le aayen

// 1. Client & Projects (Sahi hai)
Client.hasMany(Project, { foreignKey: "client_id" });
Project.belongsTo(Client, { foreignKey: "client_id" });

// 2. Board & Lists (Better version)
Board.hasMany(List, {
    foreignKey: "board_id",
    as: "lists", // Ab frontend par board.lists likhna asaan hoga
    onDelete: "CASCADE" // Board khatam, toh Lists bhi khatam!
});
List.belongsTo(Board, { foreignKey: "board_id" });

// 3. List & Cards (Trello ki jan)
// List.hasMany(Card, {
//     foreignKey: "list_id",
//     as: "cards",
//     onDelete: "CASCADE"
// });
// Card.belongsTo(List, { foreignKey: "list_id" });

// 4. Client Notes (Sahi hai)
Client.hasMany(ClientNote, { foreignKey: "client_id" });
ClientNote.belongsTo(Client, { foreignKey: "client_id" });

// 2. Export everything
export { Client, ClientNote, Project, Board, List, Card };