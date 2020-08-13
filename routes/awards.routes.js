const express = require('express')
    , mysql = require('../dbcon.js')
    , router = express.Router();

const getAllAwardsData = (res) => {
    mysql.pool.query('SELECT * FROM Awards ORDER BY awardID ASC', (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        res.json({rows: rows});
    })
}

router.route('/')
    .get(function (req, res, next) {
        mysql.pool.query("SELECT m.movieID, m.name, DATE_FORMAT(m.releaseDate, '%b %e %Y') AS releaseDate FROM Movies m ORDER BY m.name ASC", [], (err, rows2) => {
            mysql.pool.query("SELECT a.awardID, a.company, a.category, a.yearAwarded, a.movieID, m.name, DATE_FORMAT(m.releaseDate, '%b %e %Y') AS releaseDate FROM Awards a LEFT JOIN Movies m ON a.movieID = m.movieID ORDER BY a.awardID ASC", [], (err, rows) => {
                if (err) {
                    throw(err);
                } else {
                    let context = {
                        data: rows,
                        data2: rows2
                    };
                    res.render('awards', context);
                }
            });
        });
    })
    .post(function (req, res, next) {
        var context = {};
        var {company, category, yearAwarded, movieID} = req.body;
        if (movieID == "no-movie") {
            mysql.pool.query("INSERT INTO Awards (`company`, `category`, `yearAwarded`) VALUES (?, ?, ?)", [company, category, yearAwarded], function(err, result) {
                if (err) {
                    next(err);
                    return;
                }
                getAllAwardsData(res);
            });
        } else {
            mysql.pool.query("INSERT INTO Awards (`company`, `category`, `yearAwarded`, `movieID`) VALUES (?, ?, ?, ?)", [company, category, yearAwarded, movieID], function(err, result) {
                if (err) {
                    next(err);
                    return;
                }
                getAllAwardsData(res);
            });
        }
    })
    .delete(function (req, res, next) {
        var context = {};
        var {awardID} = req.body;
        mysql.pool.query("DELETE FROM Awards WHERE awardID=?", [awardID], function (err, result) {
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
        var {company, category, yearAwarded, movieID, awardID} = req.body;
        mysql.pool.query("UPDATE Awards SET company=?, category=?, yearAwarded=?, movieID=? WHERE awardID=?", [company, category, yearAwarded, movieID, awardID], function(err, result) {
            if (err) {
                next(err);
                return;
            }
            context.results = "Updated row";
            res.send(context);
        });
    });

    module.exports = router;