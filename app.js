const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
app.get("/players/", async (request, response) => {
  const getplayersQuery = `
    SELECT
      *
    FROM
      cricket_team
   ;`;
  const playersArray = await db.all(getplayersQuery);
  response.send(playersArray);
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getplayerQuery = `
    SELECT
      *
    FROM
     cricket_team
    WHERE
      player_id = ${playerId};`;
  const player = await db.get(getplayerQuery);
  response.send(player);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { player_id, player_name, jersey_number, role } = playerDetails;
  const addplayerQuery = `
    INSERT INTO
      cricket_team (player_id,player_name,jersey_number,role)
    VALUES
      (
        '${player_id}',
         ${player_name},
         ${jersey_number},
         ${role}
      );`;

  const dbResponse = await db.run(addplayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { player_id, player_name, jersey_number, role } = playerDetails;
  const updateplayerQuery = `
    UPDATE
      cricket_team
    SET
      player_id='${player_id}',
      player_name='${player_name}',
      jersey_number='${jersey_number}',
      role='${role}'
    WHERE
      player_id = ${playerId};`;
  await db.run(updateplayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteplayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  await db.run(deleteplayerQuery);
  response.send("Player Removed");
});
module.exports = app;
