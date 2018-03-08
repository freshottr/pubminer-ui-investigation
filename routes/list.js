var express = require("express");
var router = express.Router();
var pubMedQuery = require('../search');

router.get('/', (request, response) => {

    response.render('list');
});

module.exports = router;
