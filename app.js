if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const mysql = require('./dbcon.js');
const bodyParser = require('body-parser');

// constants
const port = process.env.PORT || 9716;
const app = express();

// set up handlebars
var hbs = exphbs.create({
    layoutsDir: path.join(__dirname, 'views/layouts'),
    defaultLayout:'main',
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        getAge: function (dobString) {
            if(dobString == null) {
                return "Unknown";
            }
            let currentDate = new Date();
            //clear the time from the current date so it's not considered in calculations
            currentDate.setHours(0, 0, 0, 0);
            let dob = new Date(dobString);
            let years = currentDate.getFullYear() - dob.getFullYear();
            if((currentDate.getMonth() < dob.getMonth()) || (currentDate.getMonth() === dob.getMonth() && currentDate.getDate() < dob.getDate())) {
                years -= 1;
            }
            return years;
        },
        yearOnly: function (dateString) {
            let date = new Date(dateString);
            date.setHours(0, 0, 0, 0);
            return date.getFullYear();
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

app.get('/awards', function (req, res, next) {
    res.render('awards')
});

// start app
app.listen(port, function(){
    console.log('Express started on port ' + port + '; press Ctrl-C to terminate.')
});
