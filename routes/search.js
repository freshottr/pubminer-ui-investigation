var httpRequest = require('request');
var express = require("express");
var router = express.Router();

var eUtilsBaseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
var apiKey = '';
var apiKeyParam = '';
if (apiKey !== '') {
    apiKeyParam = `&api_key=${apiKey}`
}

router.get('/', (req, response) => {

    // Search Term from the form
    var searchTerm = req.query.searchTerm;

    // Clear the search results
    req.app.locals.results = [];

    if (searchTerm.trim() == "") {
        console.log("Nothing to search!");

        // Redisplay the list page
        response.redirect('list');
    } else {
        // E-Search request
        var searchUrl = `${eUtilsBaseUrl}esearch.fcgi?db=PMC&term=${searchTerm}&retmode=json&usehistory=y${apiKeyParam}`;
        httpRequest(searchUrl, {json: true}, (err, res, body) => {
                if (err) { return console.log(err);}

                // Set the result count from the e-search result.
                req.app.locals.resultCount = body.esearchresult.count;
                req.app.locals.searchTerm = searchTerm;

                // Build the e-summary url using the webenv and querykey.
                var querykey = body.esearchresult.querykey;
                var webenv = body.esearchresult.webenv;
                var summaryUrl = `${eUtilsBaseUrl}esummary.fcgi?db=PMC&query_key=${querykey}&WebEnv=${webenv}&retmode=json&retmax=20${apiKeyParam}`;

                // E-Summary request
                httpRequest(summaryUrl, {json: true}, (err, res, body) => {
                    if (err) { return console.log(err);}

                    // Add each result to the display array
                    body.result.uids.forEach( (element) => {
                        req.app.locals.results.push(body.result[element]);
                    });

                    // Redisplay the list page
                    response.redirect('list');
                });

             });
    }
});

module.exports = router;
