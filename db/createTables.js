const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "../database.db",
  },
  useNullAsDefault: true,
});
(async () => {
  try {
    // Create a table
    await knex.schema.alterTable("user", (table) => {
      table.boolean("status").defaultTo(false);
    });
    // await knex.schema
    //   .createTable("user", (table) => {
    //     table.increments("id");
    //     table.string("login");
    //     table.string("hash");
    //   })
    // ...and another
    //   .createTable("publication", (table) => {
    //     table.increments("id");
    //     table.string("titre");
    //     table.string("content");
    //     table.integer("user_id").unsigned().references("user.id");
    //   });

    //   // Then query the table...
    //   const insertedRows = await knex("users").insert({ user_name: "Tim" });

    //   // ...and using the insert id, insert into the other table.
    //   await knex("accounts").insert({
    //     account_name: "knex",
    //     user_id: insertedRows[0],
    //   });

    //   // Query both of the rows.
    //   const selectedRows = await knex("users")
    //     .join("accounts", "users.id", "accounts.user_id")
    //     .select("users.user_name as user", "accounts.account_name as account");

    //   // map over the results
    //   const enrichedRows = selectedRows.map((row) => ({ ...row, active: true }));

    // Finally, add a catch statement
  } catch (e) {
    console.error(e);
  }
})();
// createDB();
