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

// awards page
const getAllQuery = 'SELECT * FROM Awards';
const insertQuery = "INSERT INTO Awards (`company`, `category`, `yearAwarded`, `movieID`) VALUES (?, ?, ?, ?)";
const getAllData = (res) => {
    mysql.pool.query(getAllQuery, (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        res.json({rows: rows});
    })
}
app.get('/awards', function (req, res, next) {
    mysql.pool.query("SELECT awardID, company, category, yearAwarded, movieID FROM Awards ORDER BY awardID ASC", [], (err, rows) => {
        mysql.pool.query("SELECT movieID, name, DATE_FORMAT(releaseDate, '%b %e %Y') AS releaseDate FROM Movies ORDER BY name ASC", [], (err, rows2) => {
            if (err) {
                throw(err);
            } else {
                let context = {
                    awards: rows,
                    movies: rows2
                };
                res.render('awards', context);
            }
        });
    });
});
app.post('/awards', function (req, res, next) {
    var context = {};
    var {company, category, yearAwarded, movieID} = req.body;
    mysql.pool.query(insertQuery, [company, category, yearAwarded, movieID], function(err, result) {
        if (err) {
            next(err);
            return;
        }
        getAllData(res);
    });
});
app.delete('/awards', function (req, res, next) {
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
});

// start app
app.listen(port, function(){
    console.log('Express started on port ' + port + '; press Ctrl-C to terminate.')
});
