const express = require('express')
    , mysql = require('../dbcon.js')
    , router = express.Router();

router.get('/', function (req, res) {
    mysql.pool.query("SELECT actorID, CONCAT(firstName, ' ', lastName) as `name` FROM Actors ORDER BY lastName ASC", [], (err, rows) => {
        if(err) throw(err);
        let actors = rows;
        mysql.pool.query('SELECT movieID, name FROM Movies ORDER BY name ASC', [], (err, rows) => {
            if(err) throw(err);
            let context = {
                actors: actors,
                movies: rows
            };
            res.render('actors-movies', context);
        });
    });
});

router.route('/:id')
    .get(function(req, res) {
        let sql = 'SELECT m.movieID, m.name FROM Movies m\n' +
            'JOIN ActorsMovies am ON m.movieID = am.movieID\n' +
            'WHERE am.actorID = ?\n' +
            'ORDER BY m.name ASC\n';
        mysql.pool.query(sql, [req.params.id], (error, rows) => {
           if(error) throw error;
            let context = {
                movies: rows
            };
            res.json(context);
        });
    })
    .put(function(req, res) {
        mysql.pool.query("DELETE FROM ActorsMovies WHERE actorID = (?)", [req.params.id], (error) => {
            if(error) throw(error);
            let count = 0;
            let ids = req.body.movie_ids.split(',');
            for(let movieId of ids) {
                mysql.pool.query('INSERT INTO ActorsMovies (movieID, actorID) VALUES (?, ?)', [movieId, req.params.id], (error) => {
                    if(error) {throw(error);}
                    count++;
                    if(count === ids.length) {
                        res.send({ result: true });
                    }
                });
            }
        });
    });

module.exports = router;