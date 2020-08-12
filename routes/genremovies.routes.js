const express = require('express')
    , mysql = require('../dbcon.js')
    , router = express.Router();

router.get('/', function (req, res) {
    mysql.pool.query("SELECT genreID, title FROM Genres ORDER BY title ASC", [], (err, rows) => {
        if(err) throw(err);
        let genres = rows;
        mysql.pool.query('SELECT movieID, name FROM Movies ORDER BY name ASC', [], (err, rows) => {
            if(err) throw(err);
            let context = {
                genres: genres,
                movies: rows
            };
            res.render('genres-movies', context);
        });
    });
});

router.route('/:id')
    .get(function(req, res) {
        let sql = 'SELECT m.movieID, m.name FROM Movies m\n' +
            'JOIN GenresMovies gm ON m.movieID = gm.movieID\n' +
            'WHERE gm.genreID = ?\n' +
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
        mysql.pool.query("DELETE FROM GenresMovies WHERE genreID = (?)", [req.params.id], (error) => {
            if(error) throw(error);
            let count = 0;
            let ids = req.body.movie_ids.split(',');
            for(let movieId of ids) {
                mysql.pool.query('INSERT INTO GenresMovies (movieID, genreID) VALUES (?, ?)', [movieId, req.params.id], (error) => {
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