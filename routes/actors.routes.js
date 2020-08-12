const express = require('express')
    , mysql = require('../dbcon.js')
    , router = express.Router();

router.route('/')
    .get(function (req, res) {
        mysql.pool.query("SELECT actorID, firstName, lastName, dob FROM Actors ORDER BY lastName ASC", [], (err, rows) => {
            if(err) {
                throw(err);
            } else {
                let context = {
                    actors: rows
                };
                res.render('actors', context);
            }
        });
    })
    .post(function (req, res) {
        mysql.pool.query("INSERT INTO Actors (firstName, lastName, dob) VALUES(?, ?, ?)", [req.body.firstName, req.body.lastName, req.body.dob], (error) => {
            if(error) {
                throw(error);
            } else {
                res.redirect('/actors');
            }
        })
    });

router.route('/:id')
    .delete(function(req, res) {
        mysql.pool.query("DELETE FROM Actors WHERE actorID = ?", [req.params.id], (error) => {
            if(error) {
                throw(error);
            } else {
                res.send({ result: true });
            }
        });
    })
    .put(function(req, res) {
        mysql.pool.query("UPDATE Actors SET firstName = ?, lastName = ?, dob = ? WHERE actorID = ?", [req.body.firstName, req.body.lastName, req.body.dob, req.params.id], (error) => {
            if(error) {
                throw(error);
            } else {
                res.send({ result: true });
            }
        });
    });

module.exports = router;