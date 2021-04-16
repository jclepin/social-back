const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "../database.db",
  },
  useNullAsDefault: true,
});

const users = [
  {
    login: "Joe",
    hash: "$2b$10$Xy0ZzXYfyVEoq4K0uiXBVeLoVJTQgnptKGI7xGlyEXgW3IiYedSrm",
  },
  {
    login: "Marie",
    hash: "$2b$10$Xy0ZzXYfyVEoq4K0uiXBVeLoVJTQgnptKGI7xGlyEXgW3IiYedSrm",
  },
  {
    login: "Tom",
    hash: "$2b$10$Xy0ZzXYfyVEoq4K0uiXBVeLoVJTQgnptKGI7xGlyEXgW3IiYedSrm",
  },
  {
    login: "Assen",
    hash: "$2b$10$Xy0ZzXYfyVEoq4K0uiXBVeLoVJTQgnptKGI7xGlyEXgW3IiYedSrm",
  },
  {
    login: "Jin",
    hash: "$2b$10$Xy0ZzXYfyVEoq4K0uiXBVeLoVJTQgnptKGI7xGlyEXgW3IiYedSrm",
  },
];

const posts = [
  {
    titre: "Nom 1er post",
    content: "Le contenu de mon post",
    user_id: 1,
  },
  {
    titre: "Nom 1er post",
    content: "Le contenu de mon post",
    user_id: 2,
  },
  {
    titre: "Nom 1er post",
    content: "Le contenu de mon post",
    user_id: 3,
  },
  {
    titre: "Nom 1er post",
    content: "Le contenu de mon post",
    user_id: 4,
  },
  {
    titre: "Nom 2eme post",
    content: "Le contenu de mon post",
    user_id: 1,
  },
  {
    titre: "Nom 3eme post",
    content: "Le contenu de mon post",
    user_id: 1,
  },
  {
    titre: "Nom 4eme post",
    content: "Le contenu de mon post",
    user_id: 1,
  },
];
(async () => {
  try {
    // await knex("user").insert(users);

    await knex("publication").insert(posts);
  } catch (e) {
    console.error(e);
  }
})();
