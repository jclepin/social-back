require("dotenv").config();
const express = require("express");
const jwtMiddelware = require("express-jwt");
// const Sequelize = require("sequelize");
const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./database.db",
  },
  useNullAsDefault: true,
});

app = express();
app.use(express.json());

// const sequelize = new Sequelize("sqlite:database.db");

app.use(
  jwtMiddelware({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
  }).unless({
    path: ["/posts"],
  })
);

app.use((err, req, rep, next) => {
  err ? rep.status(err.status).json({ error: err.message }) : next();
});

const posts = [
  { titre: "1 post" },
  { titre: "2 post" },
  { titre: "3 post" },
  { titre: "4 post" },
  { titre: "5 post" },
  { titre: "6 post" },
];

app.get("/posts", async (req, res) => {
  const posts = await knex("publication").select("*");
  res.json(posts);
});

// sequelize
//   .sync()
//   .then(() =>
//     app.listen("8000", () => console.log("Serveur serieux sur le port 8000"))
//   );
app.listen("8000", () => console.log("Serveur serieux sur le port 8000"));
