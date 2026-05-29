const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./database.db');

const schema = fs.readFileSync('./db/schema.sql', 'utf8');

db.exec(schema);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/save-match', (req, res) => {

  const data = req.body;

  db.run(
    `
    INSERT INTO matches(map_name, stage)
    VALUES(?, ?)
    `,
    [data.map, data.stage],

    function(err) {

      if (err) {
        console.log(err);

        return res.status(500).json({
          error: err.message
        });
      }

      const matchId = this.lastID;

      data.teams.forEach(team => {

        db.run(
          `
          INSERT INTO teams(
            match_id,
            team_name,
            captain
          )
          VALUES(?, ?, ?)
          `,
          [
            matchId,
            team.name,
            team.captain
          ],

          function(err) {

            if (err) {
              console.log(err);
              return;
            }

            const teamId = this.lastID;

            db.run(
              `
              INSERT INTO killers(
                team_id,
                killer_name,
                kills,
                pressure_points
              )
              VALUES(?, ?, ?, ?)
              `,
              [
                teamId,
                team.killer.name,
                team.killer.kills,
                team.killer.pressure
              ]
            );

            team.survivors.forEach(survivor => {

              db.run(
                `
                INSERT INTO survivors(
                  team_id,
                  survivor_name,
                  rescues,
                  generators,
                  escaped
                )
                VALUES(?, ?, ?, ?, ?)
                `,
                [
                  teamId,
                  survivor.name,
                  survivor.rescues,
                  survivor.generators,
                  survivor.escaped
                ]
              );

            });

          }
        );

      });

      db.run(
        `
        INSERT INTO penalties(
          match_id,
          enabled,
          note
        )
        VALUES(?, ?, ?)
        `,
        [
          matchId,
          data.penalty.enabled,
          data.penalty.note
        ]
      );

      res.json({
        success: true,
        matchId
      });

    }
  );

});

app.get('/api/matches', (req, res) => {

  db.all(
    `
    SELECT * FROM matches
    ORDER BY id DESC
    `,
    [],

    (err, rows) => {

      if (err) {

        return res.status(500).json({
          error: err.message
        });

      }

      res.json(rows);

    }
  );

});

app.listen(PORT, () => {

  console.log(`Server started on http://localhost:${PORT}`);

});