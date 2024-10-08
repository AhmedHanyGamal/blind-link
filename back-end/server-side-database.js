const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const db = new sqlite3.Database(
  "./server-database.db",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
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
    //                     could change the timestamp to TEXT or something (read the SQLite3 docs)
    `CREATE TABLE IF NOT EXISTS encrypted_data (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER, encrypted_data TEXT)`
  ); // note 4. timestamp could either be done as seconds
  // or it could be done as milli-seconds, so that there wouldn't be any collision when saving two new entries sequentially to the database
});

app.get("/api/get-messages", (req, res) => {
  const message_id = parseInt(req.query.message_id, 10);
  if (isNaN(message_id)) {
    return res.status(404).json({
      success: false,
      error_description:
        "message_id has to be set with a valid number in order to get the messages after it",
    });
  }

  // note 5
  // could use db.each instead, but still thinking it through

  db.all(
    "SELECT * FROM encrypted_data WHERE id >= ?",
    message_id,
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

app.post("/api/post-message", (req, res) => {
  const encryptedData = req.body;

  if (!encryptedData) {
    return res.status(400).json({
      success: false,
      error_description: "there has to be a message to send",
    });
  }

  const encryptedDataString = JSON.stringify(encryptedData);

  db.run(
    "INSERT INTO encrypted_data(timestamp, encrypted_data) VALUES (?, ?)",
    [Date.now(), encryptedDataString],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error_description: "failed to insert to the server's database",
        });
      }
      res.status(201).json({ message_id: this.lastID });
    }
  );
});

app.listen(8080, () => {
  console.log("server listening on port 8080");
});
