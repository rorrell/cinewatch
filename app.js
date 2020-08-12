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

// routes
app.use('/genres', require('./routes/genres.routes.js'));
app.use('/actors', require('./routes/actors.routes.js'));

// movies page
const getAllMoviesData = (res) => {
    mysql.pool.query("SELECT movieID, name, DATE_FORMAT(releaseDate, '%b %e %Y') AS releaseDate, averageCriticRating, synopsis FROM Movies ORDER BY movieID ASC", (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        res.json({rows: rows});
    })
}

app.get('/movies', function (req, res, next) {
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
});

app.post('/movies', function (req, res, next) {
    var context = {};
    var {name, releaseDate, averageCriticRating, synopsis} = req.body;
    mysql.pool.query("INSERT INTO Movies (`name`, `releaseDate`, `averageCriticRating`, `synopsis`) VALUES (?, ?, ?, ?)", [name, releaseDate, averageCriticRating, synopsis], function(err, result) {
        if (err) {
            next(err);
            return;
        }
        getAllMoviesData(res);
    });
});

app.delete('/movies', function (req, res, next) {
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
});

app.put('/movies', function (req, res, next) {
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
});

// theatres page
const getAllTheatresData = (res) => {
    mysql.pool.query('SELECT * FROM Theatres ORDER BY theatreID ASC', (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        res.json({rows: rows});
    })
}

app.get('/theatres', function (req, res, next) {
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
});

app.post('/theatres', function (req, res, next) {
    var context = {};
    var {name, city, state} = req.body;
    mysql.pool.query("INSERT INTO Theatres (`name`, `city`, `state`) VALUES (?, ?, ?)", [name, city, state], function(err, result) {
        if (err) {
            next(err);
            return;
        }
        getAllTheatresData(res);
    });
});

app.delete('/theatres', function (req, res, next) {
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
});

app.put('/theatres', function (req, res, next) {
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

// awards page
const getAllAwardsData = (res) => {
    mysql.pool.query('SELECT * FROM Awards ORDER BY awardID ASC', (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        res.json({rows: rows});
    })
}

app.get('/awards', function (req, res, next) {
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
});

app.post('/awards', function (req, res, next) {
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

app.put('/awards', function (req, res, next) {
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

// start app
app.listen(port, function(){
    console.log('Express started on port ' + port + '; press Ctrl-C to terminate.')
});
