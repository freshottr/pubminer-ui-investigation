// app.js
var express = require('express');
var path = require('path');
var list = require('./routes/list');
var results = require('./routes/results');
var detail = require('./routes/detail');
var app = express();
//var db = require('./db')
require('dotenv').config();

app.set('views', './views');    // where to find the views
app.set('view engine', 'pug');  // use pug as the template engine

// Requests for the root should display the 'list' view
app.get('/', (request, response) => {
    response.redirect('list');
});

// Static elements are served out of the public folder
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
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
    response.status(404);
    response.send('File could not be found');
});

module.exports = app;
