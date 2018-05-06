// app.js
const express = require('express');
const path = require('path');
const bodyparser = require('body-parser');
const list = require('./routes/list');
const results = require('./routes/results');
const detail = require('./routes/detail');
const app = express();
const Errors = require('./Errors');

require('dotenv').config();

app.set('views', './views');    // where to find the views
app.set('view engine', 'pug');  // use pug as the template engine

// Requests for the root should display the 'list' view
app.get('/', (request, response) => {
    response.redirect('list');
});

// initialize body-parser
app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());

// Static elements are served out of the public folder
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/scripts', express.static(path.join(__dirname, 'public', 'scripts')));
app.use('/data', express.static(path.join(__dirname, 'public', 'data')));

// bower_components should be moved to a vendor script folder
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));

// Allow static files from node_modules to be served.
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// The app recognizes these routes:
app.use('/list', list);
app.use('/results', results);
app.use('/detail', detail);

// Handle anything we don't specifically recognize
app.use((request, response, next) => {
    /* jshint unused: vars */
    response.status(404);
    response.send('File could not be found');
});


app.use((err, req, res, next) => {
    /* jshint unused: vars */
    console.error(`in global error handler handling ${err.stack}`);
    const errMsg = {
        error: {
            msg: err.message || 'An internal error occurred. Please try again',
            severity: err.severity || Errors.Severity.Danger
        }
    };

    const template = req.xhr ? 'messages' : 'results';
    res.status(500).render(template, errMsg);
});

module.exports = app;
