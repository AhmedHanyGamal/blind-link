const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const db = new sqlite3.Database(
  "./server-database.db",
  sqlite3.OPEN_READWRITE, // note 2. Could change this
  (err) => {
    if (err) {
      return console.error(err);
    }

    console.log("database accessed successfully");
  }
);

db.serialize(() => {
  db.run(
    // note 3. The id being an INTEGER could cause a problem in the VERY DISTANT future (overflow)
    `CREATE TABLE IF NOT EXISTS encrypted_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER, encrypted_message TEXT)`
  ); // note 4. timestamp could either be done as seconds
  // or it could be done as milli-seconds, so that there wouldn't be any collision when saving two new entries sequentially to the database
});

app.get("/api/get-messages", (req, res) => {
  const timestamp = req.query.timestamp;
  if (!timestamp) {
    return res.status(404).json({
      success: false,
      error_description:
        "timestamp is required in order to get the messages after it",
    });
  }

  // note 5
  // could use db.each instead, but still thinking it through

  db.all(
    "SELECT * FROM encrypted_messages WHERE timestamp >= ?",
    timestamp,
    (err, rows) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, error_description: err.message });
      } else {
        return res.status(200).json({ success: true, data: rows });
      }
    }
  );
});

//question: sequential vs parallel
app.post("/api/post-message", (req, res) => {
  const { encrypted_message } = req.body;

  if (!encrypted_message) {
    return res
      .status(400)
      .json({
        success: false,
        error_description: "there has to be a message to send",
      });
  }

  db.run(
    "INSERT INTO encrypted_messages(timestamp, encrypted_message) VALUES (?, ?)",
    [Date.now(), encrypted_message],
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error_description: "failed to insert to the server's database",
        });
      }
      res.status(201).json({ success: true });
    }
  );
});

// db.run(
//   "INSERT INTO encrypted_messages(timestamp, encrypted_message) VALUES (?, ?)",
//   [1721071951346, "Hello"]
// );
// db.run(
//   "INSERT INTO encrypted_messages(timestamp, encrypted_message) VALUES (?, ?)",
//   [1721071951350, "Is it me you're looking for"]
// );
// db.run(
//   "INSERT INTO encrypted_messages(timestamp, encrypted_message) VALUES (?, ?)",
//   [1721071951441, "I AM DA ONE"]
// );
// db.run(
//   "INSERT INTO encrypted_messages(timestamp, encrypted_message) VALUES (?, ?)",
//   [1721071951451, "DON'T WANT YOU'RE SON"]
// );
// db.run(
//   "INSERT INTO encrypted_messages(timestamp, encrypted_message) VALUES (?, ?)",
//   [1721071951541, "DON'T NEED A GUN"]
// );
// db.run(
//   "INSERT INTO encrypted_messages(timestamp, encrypted_message) VALUES (?, ?)",
//   [1721071951551, "TO GET RESPECT"]
// );
// db.run(
//   "INSERT INTO encrypted_messages(timestamp, encrypted_message) VALUES (?, ?)",
//   [1721071955541, "UP ON DA STREETZ"]
// );

// db.run("DELETE FROM encrypted_messages");

// db.all("SELECT * FROM encrypted_messages", (err, rows) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(rows);
//   }
// });

app.listen(8080, () => {
  console.log("server listening on port 8080");
});

// console.log(Date.now());
