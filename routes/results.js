var express = require("express");
var router = express.Router();
var pubMedQuery = require('../search');

router.get('/', (request, response) => {

    const initialRowRequestSize = 20;

    // search PubMed for results matching the search terms
    pubMedQuery.search(request.query.searchTerm, (queryResult) => {

        if (queryResult.itemsFound == 0) {
            // Render the 'results' view
            response.render('results', {"results": {items: []},
                                        "qryResult": queryResult});
        } else {
            // Get summaries for the first set of result rows
            pubMedQuery.getSummaries(queryResult.webenv, queryResult.querykey, 0, initialRowRequestSize, (results) => {

                var nextRow = initialRowRequestSize + 1;
                var rowCount = initialRowRequestSize;
                if (queryResult.itemsFound < initialRowRequestSize) {
                    nextRow = 0;
                    rowCount = 0;
                }
                // Render the 'results' view using query results
                response.render('results', {"results": results,
                                            "qryResult": queryResult,
                                            "nextRow": nextRow,
                                            "rowCount": rowCount});
            });
        }
    });
});

router.get('/:webenv/:querykey', function(req, res, next) {

    // Get summaries for result rows
    pubMedQuery.getSummaries(req.params.webenv, req.params.querykey, req.query.start, req.query.count, (results) => {

        // Render the 'list' view using query results, if any
        res.render('resultRows', { "results": results });
    });

});

module.exports = router;
