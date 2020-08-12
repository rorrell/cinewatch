const express = require('express')
    , mysql = require('../dbcon.js')
    , router = express.Router();

router.route('/')
    .get(function (req, res) {
        mysql.pool.query("SELECT genreID, title FROM Genres ORDER BY title ASC", [], (err, rows) => {
            if(err) {
                throw(err);
            } else {
                let context = {
                    genres: rows
                };
                res.render('genres', context);
            }
        });
    })
    .post(function (req, res) {
        mysql.pool.query("INSERT INTO Genres (title) VALUES (?)", [req.body.title], (error) => {
            if(error) {
                throw(error);
            } else {
                res.redirect('/genres');
            }
        })
    });

router.route('/:id')
    .delete(function(req, res) {
        mysql.pool.query("DELETE FROM Genres WHERE genreID = ?", [req.params.id], (error) => {
            if(error) {
                throw(error);
            } else {
                res.send({ result: true });
            }
        });
    })
    .put(function(req, res) {
        mysql.pool.query("UPDATE Genres SET title = ? WHERE genreID = ?", [req.body.title, req.params.id], (error) => {
            if(error) {
                throw(error);
            } else {
                res.send({ result: true });
            }
        });
    });

module.exports = router;