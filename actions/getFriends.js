const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./database.db",
  },
  useNullAsDefault: true,
});

const getFriends = async (userID) => {
  return await knex("friend")
    .join("user", "friend.friend_id", "user.id")
    .where("friend.user_id", userID)
    .select("user.id as id", "login", "status");
};

exports.getFriends = getFriends;
