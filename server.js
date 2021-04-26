require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
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
const { getFriends } = require("./actions/getFriends");
// const Sequelize = require("sequelize");
const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./database.db",
  },
  useNullAsDefault: true,
});

const SECRET = process.env.JWT_SECRET;

// var whitelist = [process.env.FRONT_URL, process.env.FRONT_URL_HEROKU];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   optionsSuccessStatus: 200,
//   credentials: true,
// };

const corsOptions = {
  origin: process.env.FRONT_URL,
  optionsSuccessStatus: 200,
  credentials: true,
};

app = express();
app.use(express.json());
app.use(cors(corsOptions));

// const sequelize = new Sequelize("sqlite:database.db");

app.use(
  cookieParser(),
  jwtMiddelware({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    getToken: (req) => req.cookies.token,
  }).unless({
    path: ["/", "/login", "/register"],
  })
);

app.use((err, req, rep, next) => {
  err ? rep.status(err.status).json({ error: err.message }) : next();
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

app.post("/register", async (req, res) => {
  if (req.body.login === "" || req.body.password === "") {
    res.status(400).json({ erreur: "login ou pass non fournis" });
  } else {
    const set = await knex("user").insert({
      login: req.body.login,
      hash: await hash(req.body.password),
    });
    res.json(set);
  }
});

app.post("/login", async (req, res) => {
  const { login, password } = req.body;

  let utilisateur = await knex("user")
    .where("login", "like", login)
    .select(`*`);
  utilisateur = utilisateur[0];
  if (!utilisateur) {
    res
      .status(403)
      .json({ erreur: "Informations d'identification incorrects" });
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

      //status = 1
      await knex("user").update({ status: 1 }).where({ id: utilisateur.id });
      delete utilisateur["hash"];

      //friends
      const friends = await getFriends(utilisateur.id);

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(Date.now() + 604800000),
        // domain: "http://localhost:8000",
      });

      res.json({ user: utilisateur, friends });
    } else {
      res
        .status(403)
        .json({ erreur: "Informations d'identification incorrects" });
    }
  }
});

// app.get("/cookie", (req, rep) => {
//   try {
//     rep.cookie("token", "lesupertoken", {
//       httpOnly: true,
//       secure: false,
//       domain: "http://localhost:3000",
//     });
//     rep.json("cookie send");
//   } catch (e) {
//     rep.status(403).json("not send");
//   }
// });

app.get("/posts/me", async (req, res) => {
  //   const posts = await knex("publication").select("*");
  const posts = await knex("user")
    .join("publication", "user.id", "publication.user_id")
    .select("*")
    .where("user.id", req.user.id)
    .orderBy("publication.id", "desc");
  const postsClean = posts.map((post) => {
    delete post["hash"];
    return post;
  });

  res.json(postsClean);
});
app.get("/posts/:id", async (req, res) => {
  //   const posts = await knex("publication").select("*");
  const posts = await knex("user")
    .join("publication", "user.id", "publication.user_id")
    .select("*")
    .where("user.id", req.params.id)
    .orWhere("parent_user_id", req.params.id)
    .orderBy("publication.id", "desc");
  const postsClean = posts.map((post) => {
    delete post["hash"];
    return post;
  });

  res.json(postsClean);
});

app.get("/posts", async (req, res) => {
  //   const posts = await knex("publication").select("*");
  const posts = await knex("user")
    .join("publication", "user.id", "publication.user_id")
    .select("*")
    // .where("public", 1)
    .orderBy("publication.id", "desc");

  const postsClean = posts.map((post) => {
    delete post["hash"];
    return post;
  });

  res.json(postsClean);
});

app.get("/users", async (req, res) => {
  try {
    const users = await knex("user").select("*");
    const usersClean = users
      .filter((friend) => friend.id !== req.user.id)
      .map((user) => {
        delete user["hash"];
        return user;
      });
    res.json(usersClean);
  } catch (e) {
    console.log("🚀 ~ file: server.js ~ line 109 ~ app.get ~ e", e);
  }
});

app.get("/me", async (req, res) => {
  const me = await knex("user").select("id", "login").where("id", req.user.id);
  //   console.log("🚀 ~ file: server.js ~ line 221 ~ app.get ~ me", me);
  const friends = await getFriends(req.user.id);
  res.json({ user: me[0], friends });
});

app.post("/post", async (req, res) => {
  if (
    ((req.body.titre !== null && req.body.titre.length > 0) ||
      req.body.parent) &&
    req.body.content.length > 0
  ) {
    await knex("publication").insert({
      ...req.body,
      user_id: req.user.id,
    });

    const posts = await knex("user")
      .join("publication", "user.id", "publication.user_id")
      .select("*")
      .where("public", 1)
      .orderBy("publication.id", "desc");

    const postsClean = posts.map((post) => {
      delete post["hash"];
      return post;
    });

    res.json(postsClean);
  } else {
    res.status(403).json({ erreur: "Rien à publier" });
  }
});

app.get("/friends", async (req, res) => {
  //friends
  const friends = await getFriends(req.user.id);

  res.json(friends);
});

app.post("/friends", async (req, res) => {
  await knex("friend").insert([
    {
      user_id: req.user.id,
      friend_id: req.body.friendId,
    },
    {
      user_id: req.body.friendId,
      friend_id: req.user.id,
    },
  ]);

  const friends = await getFriends(req.user.id);

  res.json({ friends });
});

app.get("/disconnect", async (req, res) => {
  const reponse = await knex("user")
    .update({ status: 0 })
    .where({ id: req.user.id });
  res.cookie("token", null);
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
