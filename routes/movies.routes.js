const express = require('express')
    , mysql = require('../dbcon.js')
    , router = express.Router();

const getAllMoviesData = (res) => {
    mysql.pool.query("SELECT movieID, name, DATE_FORMAT(releaseDate, '%b %e %Y') AS releaseDate, averageCriticRating, synopsis FROM Movies ORDER BY movieID ASC", (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        res.json({rows: rows});
    })
}

router.route('/')
    .get(function (req, res, next) {
        mysql.pool.query("SELECT movieID, name, DATE_FORMAT(releaseDate, '%b %e %Y') AS releaseDate, averageCriticRating, synopsis FROM Movies ORDER BY movieID ASC", [], (err, rows) => {
            if (err) {
                throw(err);
            } else {
                let context = {
                    movies: rows
                };
                res.render('movies', context);
            }
        });
    })
    .post(function (req, res, next) {
        var context = {};
        var {name, releaseDate, averageCriticRating, synopsis} = req.body;
        mysql.pool.query("INSERT INTO Movies (`name`, `releaseDate`, `averageCriticRating`, `synopsis`) VALUES (?, ?, ?, ?)", [name, releaseDate, averageCriticRating, synopsis], function(err, result) {
            if (err) {
                next(err);
                return;
            }
            getAllMoviesData(res);
        });
    })
    .delete(function (req, res, next) {
        var context = {};
        var {movieID} = req.body;
        mysql.pool.query("DELETE FROM Movies WHERE movieID=?", [movieID], function (err, result) {
            if (err) {
                next(err);
                return;
            }
            context.results = "Deleted row";
            res.send(context);
        });
    })
    .put(function (req, res, next) {
        var context = {};
        var {name, releaseDate, averageCriticRating, synopsis, movieID} = req.body;
        mysql.pool.query("UPDATE Movies SET name=?, releaseDate=?, averageCriticRating=?, synopsis=? WHERE movieID=?", [name, releaseDate, averageCriticRating, synopsis, movieID], function(err, result) {
            if (err) {
                next(err);
                return;
            }
            context.results = "Updated row";
            res.send(context);
        });
    })

router.route('/search/')
    .get(function (req, res, next) {
        let queryString = "SELECT DISTINCT m.movieID, m.name, DATE_FORMAT(m.releaseDate, '%b %e %Y') AS releaseDate, m.averageCriticRating, m.synopsis FROM Movies m JOIN GenresMovies gm ON gm.movieID = m.movieID JOIN Genres g ON g.genreID = gm.genreID JOIN ActorsMovies am ON am.movieID = m.movieID JOIN Actors ac ON ac.actorID = am.actorID JOIN Awards aw ON aw.movieID = m.movieID WHERE ";
        let queryVariables = ["m.name", "g.title", "ac.firstName", "ac.lastName", "aw.company", "aw.category"];
        let counter = 0;
        let firstMarker = false;
        for (i in req.query) {
            if (firstMarker == false) {
                if (req.query[i] != "null") {
                    queryString = queryString + "LOWER(" + queryVariables[counter] + ")" + " LIKE CONCAT('%', LOWER('" + req.query[i] + "'), '%') ";
                    firstMarker = true;
                }
                counter += 1;
            } else {
                if (req.query[i] != "null") {
                    queryString = queryString + "AND " + "LOWER(" + queryVariables[counter] + ")" + " LIKE CONCAT('%', LOWER('" + req.query[i] + "'), '%') ";
                }
                counter += 1;
            }
        }
        mysql.pool.query(queryString, [], function(err, result) {
            if (err) {
                next(err);
                return;
            }
            console.log(result);
            res.send(result);
        });
    });

    module.exports = router;