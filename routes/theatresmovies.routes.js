const express = require('express')
    , mysql = require('../dbcon.js')
    , router = express.Router();

const getAllTMData = (res) => {
    mysql.pool.query("SELECT t.theatreID, t.name AS tname, m.movieID, m.name AS mname, tm.theatreID, tm.movieID FROM Theatres t, Movies m, TheatresMovies tm WHERE tm.theatreID = t.theatreID AND tm.movieID = m.movieID ORDER BY tm.theatreID ASC", (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        res.json({rows: rows});
    })
}

router.route('/')
    .get(function (req, res, next) {
        mysql.pool.query("SELECT t.theatreID, t.name, t.city, t.state FROM Theatres t ORDER BY t.name ASC", [], (err, rows) => {
            mysql.pool.query("SELECT m.movieID, m.name, DATE_FORMAT(m.releaseDate, '%b %e %Y') AS releaseDate FROM Movies m ORDER BY m.name ASC", [], (err, rows2) => {
                mysql.pool.query("SELECT t.theatreID, t.name AS tname, m.movieID, m.name AS mname, tm.theatreID, tm.movieID FROM Theatres t, Movies m, TheatresMovies tm WHERE tm.theatreID = t.theatreID AND tm.movieID = m.movieID ORDER BY tm.theatreID ASC", [], (err, rows3) => {
                    if (err) {
                        throw(err);
                    } else {
                        let context = {
                            data: rows,
                            data2: rows2,
                            data3: rows3
                        };
                        res.render('theatresmovies', context);
                    }
                });
            });
        });
    })
    .post(function (req, res, next) {
        var {theatreID, movieID} = req.body;
        mysql.pool.query("INSERT INTO TheatresMovies (`theatreID`, `movieID`) VALUES (?, ?)", [theatreID, movieID], function(err, result) {
            if (err) {
                next(err);
                return;
            }
            getAllTMData(res);
        });
    })
    .delete(function (req, res, next) {
        var context = {};
        var {theatreID, movieID} = req.body;
        mysql.pool.query("DELETE FROM TheatresMovies WHERE theatreID=? AND movieID=?", [theatreID, movieID], function (err, result) {
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
        var {theatreID, movieID, oldtheatreID, oldmovieID} = req.body;
        mysql.pool.query("UPDATE TheatresMovies SET theatreID=?, movieID=? WHERE theatreID=? AND movieID=?", [theatreID, movieID, oldtheatreID, oldmovieID], function(err, result) {
            if (err) {
                next(err);
                return;
            }
            getAllTMData(res);
        });
    });

module.exports = router;