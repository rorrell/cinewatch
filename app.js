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
app.use('/genremovies', require('./routes/genremovies.routes.js'));
app.use('/actormovies', require('./routes/actormovies.routes.js'));
app.use('/movies', require('./routes/movies.routes.js'));
app.use('/theatres', require('./routes/theatres.routes.js'));
app.use('/awards', require('./routes/awards.routes.js'));
app.use('/theatresmovies', require('./routes/theatresmovies.routes.js'));

// start app
app.listen(port, function(){
    console.log('Express started on port ' + port + '; press Ctrl-C to terminate.')
});
