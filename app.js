if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const mysql = require('./dbcon.js');
const bodyParser = require('body-parser');
const moment = require('moment');

// constants
const port = process.env.PORT || 9716;
const app = express();

// set up handlebars
var hbs = exphbs.create({
    layoutsDir: path.join(__dirname, 'views/layouts'),
    defaultLayout:'main',
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        moment: require('helper-moment'),
        getAge: function (dobString) {
            if(dobString == null) {
                return "Unknown";
            }
            let dob = moment(dobString);
            let now = moment().local();
            let age = moment.duration(now.diff(dob));
            return Math.floor(age.asYears());
        },
        yearOnly: function (dateString) {
            let date = moment(dateString).local();
            date.set({hours:0,minutes:0,seconds:0});
            return date.year();
        }
    }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

//set up body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set up file location for static files
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', function (req, res, next) {
    let context = {
        message: "Welcome to CineWatch!"
    };
    res.render('home', context);
});

app.get('/movies', function (req, res, next) {
    res.render('movies');
});

app.get('/theatres', function (req, res, next) {
    res.render('theatres')
});

app.get('/genres', function (req, res, next) {
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
});

app.post('/genres', function (req, res, next) {
    mysql.pool.query("CALL InsertGenre(?)", [req.body.textNew], (error, rows) => {
        if(error) {
            throw(error);
        } else {
           res.send({ id: rows[0][0]['id'] });
        }
    })
});

app.get('/genres/delete/:id', function(req, res, next) {
   mysql.pool.query("DELETE FROM Genres WHERE genreID = ?", [req.params.id], (error, rows) => {
       if(error) {
           throw(error);
       } else {
           res.send({ result: true });
       }
   });
});

app.post('/genres/update/:id', function(req, res, next) {
   mysql.pool.query("UPDATE Genres SET title = ? WHERE genreID = ?", [req.body.title, req.params.id], (error, rows) => {
      if(error) {
          throw(error);
      } else {
          res.send({ result: true });
      }
   });
});

app.get('/actors', function (req, res, next) {
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
});

app.post('/actors', function (req, res, next) {
    mysql.pool.query("CALL InsertActor(?, ?, ?)", [req.body.firstName, req.body.lastName, req.body.dob], (error, rows) => {
        if(error) {
            throw(error);
        } else {
            res.send({ id: rows[0][0]['id'] });
        }
    })
});

app.get('/actors/delete/:id', function(req, res, next) {
    mysql.pool.query("DELETE FROM Actors WHERE actorID = ?", [req.params.id], (error, rows) => {
        if(error) {
            throw(error);
        } else {
            res.send({ result: true });
        }
    });
});

app.post('/actors/update/:id', function(req, res, next) {
    mysql.pool.query("UPDATE Actors SET firstName = ?, lastName = ?, dob = ? WHERE actorID = ?", [req.body.firstName, req.body.lastName, req.body.dob, req.params.id], (error, rows) => {
        if(error) {
            throw(error);
        } else {
            res.send({ result: true });
        }
    });
});

app.get('/awards', function (req, res, next) {
    res.render('awards')
});

// start app
app.listen(port, function(){
    console.log('Express started on port ' + port + '; press Ctrl-C to terminate.')
});
