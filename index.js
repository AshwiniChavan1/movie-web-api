const express = require('express');
const mysql = require('mysql');
const app = express();
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'foo',
    password: 'bar',
    database: 'movies_db',
    multipleStatements: true
});

app.use(express.json());

app.get('/api/v1/longest-duration-movies', (req, res) => {
    connection.query("SELECT * FROM movies ORDER BY runtimeMinutes DESC LIMIT 10;", (err, rows, fields) => {
        if (err) throw err;
        let arr = [];
        for (let r of rows) {
            let movie = {};
            for (let f of fields) {
                movie[f.name] = r[f.name];
            }
            arr.push(movie);
        }
        res.json(arr);
    });
});

app.post('/api/v1/new-movie', (req, res) => {
    let movie = req.body;
    connection.beginTransaction();
    connection.query(`insert into movies values("${movie["tconst"]}", "${movie["titleType"]}", "${movie["primaryTitle"]}", "${movie["runtimeMinutes"]}", "${movie["genres"]}"); insert into ratings values("${movie["tconst"]}","${movie["averageRating"]}","${movie["numVotes"]}");`, (err, rows, fields) => {
        if (err) {
            console.log(err);
            res.send("Cannot save the movie: " + err.message);
            connection.rollback();
        } else {
            res.send("Saved movie successfully!");
            connection.commit();
        }
    });
});



app.listen(3000);
