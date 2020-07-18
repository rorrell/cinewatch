const express = require('express');
const handlebars = require('express-handlebars');
const path = require('path');
const mysql = require('./dbcon.js');
const bodyParser = require('body-parser');

// constants
const port = 9716;
const app = express();

// set up handlebars
app.set('view engine', 'handlebars');
app.engine('handlebars', handlebars({
    layoutsDir: path.join(__dirname, 'views/layouts'),
    defaultLayout:'main',
    partialsDir: path.join(__dirname, 'views/partials')
}));

//set up body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set up file location for static files
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req, res, next) => {
    let context = {
        message: "Welcome!"
    };
    res.render('home', context);
});

// start app
app.listen(port, function(){
    console.log('Express started on port ' + port + '; press Ctrl-C to terminate.')
});