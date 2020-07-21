const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const mysql = require('./dbcon.js');
const bodyParser = require('body-parser');
const movies = require('./movies')

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

app.get('/login', function (req, res, next) {
    let context = {
        isLoggedIn: true
    }
    res.render('login', context);
});

app.get('/recovery', function (req, res, next) {
    res.render('recovery')
});

app.get('/register', function (req, res, next) {
    res.render('register')
});

app.get('/dashboard', function (req, res, next) {
    let context = {
        movies: movies.filter(mov => mov.movieID == 1),
        isDashboard: true
    };
    res.render('dashboard', context);
});

app.get('/movie/:id', function (req, res, next) {
    let context = movies.find(mov => mov.movieID.toString() === req.params.id);
    res.render('movie', context);
});

app.get('/movies', function (req, res, next) {
    let results = movies.filter(mov => mov.name.toLowerCase().includes(req.query.q.toLowerCase()) && mov.movieID > 1);
    let context = {
        movies: results,
        isDashboard: false
    };
    res.render('dashboard', context);
});

// start app
app.listen(port, function(){
    console.log('Express started on port ' + port + '; press Ctrl-C to terminate.')
});
