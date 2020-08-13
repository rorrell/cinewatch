const express = require('express')
    , mysql = require('../dbcon.js')
    , router = express.Router();

const getAllTheatresData = (res) => {
    mysql.pool.query('SELECT * FROM Theatres ORDER BY theatreID ASC', (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        res.json({rows: rows});
    })
}

router.route('/')
    .get(function (req, res, next) {
        mysql.pool.query("SELECT theatreID, name, city, state FROM Theatres ORDER BY theatreID ASC", [], (err, rows) => {
            if (err) {
                throw(err);
            } else {
                let context = {
                    theatres: rows
                };
                res.render('theatres', context);
            }
        });
    })
    .post(function (req, res, next) {
        var context = {};
        var {name, city, state} = req.body;
        mysql.pool.query("INSERT INTO Theatres (`name`, `city`, `state`) VALUES (?, ?, ?)", [name, city, state], function(err, result) {
            if (err) {
                next(err);
                return;
            }
            getAllTheatresData(res);
        });
    })
    .delete(function (req, res, next) {
        var context = {};
        var {theatreID} = req.body;
        mysql.pool.query("DELETE FROM Theatres WHERE theatreID=?", [theatreID], function (err, result) {
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
        var {name, city, state, theatreID} = req.body;
        mysql.pool.query("UPDATE Theatres SET name=?, city=?, state=? WHERE theatreID=?", [name, city, state, theatreID], function(err, result) {
            if (err) {
                next(err);
                return;
            }
            context.results = "Updated row";
            res.send(context);
        });
    });

module.exports = router;
