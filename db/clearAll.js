const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "../database.db",
  },
  useNullAsDefault: true,
});

(async () => {
  try {
    await knex("friend").del();
    await knex("publication").del();
    await knex("user").del();
  } catch (e) {
    console.error(e);
  }
})();
