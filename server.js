require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwtMiddelware = require("express-jwt");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const hash = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

const compare = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
const jwt = require("jsonwebtoken");
// const Sequelize = require("sequelize");
const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./database.db",
  },
  useNullAsDefault: true,
});

const SECRET = process.env.JWT_SECRET;

const corsOptions = {
  origin: process.env.FRONT_URL,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app = express();
app.use(express.json());
app.use(cors(corsOptions));

// const sequelize = new Sequelize("sqlite:database.db");

app.use(
  jwtMiddelware({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
  }).unless({
    path: ["/", "/posts", "/users", "/login"],
  })
);

app.use((err, req, rep, next) => {
  err ? rep.status(err.status).json({ error: err.message }) : next();
});

app.get("/", (req, res) => res.json({ Error: "GET not valid" }));

app.post("/login", async (req, rep) => {
  const { login, password } = req.body;

  let utilisateur = await knex("user")
    .where("login", "like", login)
    .select(`*`);
  utilisateur = utilisateur[0];
  if (!utilisateur) {
    rep.json({ erreur: "non autorisé" });
  } else {
    compare(password, utilisateur.hash).then((same) => {
      if (same) {
        const token = jwt.sign(
          {
            login,
            role: utilisateur.role,
          },
          SECRET,
          {
            expiresIn: "1h",
          }
        );
        rep.json({ token });
      } else {
        rep.status(403).json({ erreur: "non autorisé" });
      }
    });
  }
});

app.get("/posts", async (req, res) => {
  //   const posts = await knex("publication").select("*");
  const posts = await knex("user")
    .join("publication", "user.id", "publication.user_id")
    .select("*");
  res.json(posts);
});
app.get("/users", async (req, res) => {
  const users = await knex("user").select("*");
  console.log("🚀 ~ file: server.js ~ line 40 ~ app.get ~ users", users);
  res.json(users);
});

// sequelize
//   .sync()
//   .then(() =>
//     app.listen("8000", () => console.log("Serveur serieux sur le port 8000"))
//   );
app.listen("8000", () => console.log("Serveur serieux sur le port 8000"));
