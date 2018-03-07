var express = require("express");
var router = express.Router();
var pubMedQuery = require('../search');

router.get('/', (request, response) => {

    // search PubMed for results matching the search terms
    pubMedQuery.search(request.query.searchTerm, (queryResult) => {

        // Render the 'list' view using query results, if any
        response.render('list', {"searchTerm": queryResult.searchTerm,
                                 "itemsFound": queryResult.itemsFound,
                                 "itemsReturned": queryResult.itemsReturned,
                                 "items": queryResult.items});
    });

});

module.exports = router;
