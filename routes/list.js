var express = require("express");
var router = express.Router();
var pubMedQuery = require('../search');

router.get('/', (request, response) => {

    // search PubMed for results matching the search terms
    pubMedQuery.search(request.query.searchTerm, (queryResult) => {

        // Render the 'list' view using query results, if any
        response.render('list', {"results": queryResult});
    });

});

module.exports = router;
