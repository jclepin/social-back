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
    path: ["/", "/posts", "/login", "/resetStatus"],
  })
);

app.use((err, req, rep, next) => {
  err ? rep.status(200).json({ error: err.message }) : next();
  //   err ? rep.status(err.status).json({ error: err.message }) : next();
});

const tryCatch = (tryer) => {
  try {
    const result = tryer();
    return [result, null];
  } catch (error) {
    return [null, error];
  }
};

//   const [data, err] = tryCatch(() => getData(2));

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
    if (await compare(password, utilisateur.hash)) {
      const token = jwt.sign(
        {
          id: utilisateur.id,
          login,
          role: utilisateur.role,
        },
        SECRET,
        {
          expiresIn: "1h",
        }
      );
      await knex("user").update({ status: 1 }).where({ id: utilisateur.id });
      rep.json({ token });
    } else {
      rep.status(403).json({ erreur: "non autorisé" });
    }
  }
});

app.get("/posts", async (req, res) => {
  //   const posts = await knex("publication").select("*");
  const posts = await knex("user")
    .join("publication", "user.id", "publication.user_id")
    .select("*");
  const postsClean = posts.map((post) => {
    delete post["hash"];
    return post;
  });

  res.json(postsClean);
});
app.get("/users", async (req, res) => {
  try {
    const users = await knex("user").select("*");
    const usersClean = users.map((user) => {
      delete user["hash"];
      return user;
    });
    res.json(usersClean);
  } catch (e) {
    console.log("🚀 ~ file: server.js ~ line 109 ~ app.get ~ e", e);
  }
});

app.get("/disconnect", async (req, res) => {
  console.log(
    "🚀 ~ file: server.js ~ line 121 ~ app.get ~ req.user.id",
    req.user.id
  );
  const reponse = await knex("user")
    .update({ status: 0 })
    .where({ id: req.user.id });
  res.json({ reponse });
});
app.get("/resetStatus", async (req, res) => {
  const reponse = await knex("user").update({ status: 0 }).where({ status: 1 });
  res.json({ reponse });
});
// sequelize
//   .sync()
//   .then(() =>
//     app.listen("8000", () => console.log("Serveur serieux sur le port 8000"))
//   );
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Serveur serieux sur le port ${port}`));
