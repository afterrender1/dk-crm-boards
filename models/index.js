import Client from "./Client";
import ClientNote from "./ClientNote";
import Project from "./Project";
import List from "./List";
import Board from "./Board";
import Card from "./Card";
import Comment from "./Comment";


Client.hasMany(Project, { foreignKey: "client_id" });
Project.belongsTo(Client, { foreignKey: "client_id" });

// 2. Board & Lists (Better version)
Board.hasMany(List, {
    foreignKey: "board_id",
    as: "lists",
    onDelete: "CASCADE"
});
List.belongsTo(Board, { foreignKey: "board_id" });

List.hasMany(Card, {
    foreignKey: "list_id",
    as: "cards",
    onDelete: "CASCADE"
});
Card.belongsTo(List, { foreignKey: "list_id" });

Card.hasMany(Comment, {
    foreignKey: "card_id",
    as: "comments",
    onDelete: "CASCADE"
});

Comment.belongsTo(Card, {
    foreignKey: "card_id",
    as: "card"
})

Client.hasMany(ClientNote, { foreignKey: "client_id" });
ClientNote.belongsTo(Client, { foreignKey: "client_id" });

// 2. Export everything
export { Client, ClientNote, Project, Board, List, Card , Comment };