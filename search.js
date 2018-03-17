// search.js

let httpRequest = require('request');

// base url for all E-Utilities requests
const eUtilsBaseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';

let pubMedApi = {

    search : function(searchTerm, callback) {

        // setup the api key parameter if an api key is available.
        var apiKey = '';
        var apiKeyParam = '';
        if (apiKey !== '') {
            apiKeyParam = `&api_key=${apiKey}`
        }

        // results object initialized with 'no results found' data
        var results = {searchTerm: '', itemsFound: 0, itemsReturned: 0, items: []};

        if (typeof searchTerm === "undefined" || searchTerm.trim() == "") {
            // signal the caller that the (empty) results are ready
            callback(results);

        } else {
            // E-Search request
            var searchUrl = `${eUtilsBaseUrl}esearch.fcgi?db=PMC&term=${searchTerm}&retmode=json&usehistory=y${apiKeyParam}`;
            httpRequest(searchUrl, {json: true}, (err, response, body) => {
                if (err) {
                    return console.log(err);
                }

                // populate the results object with the pices we already know
                results.searchTerm = searchTerm;
                results.itemsFound = body.esearchresult.count;
                results.itemsReturned = body.esearchresult.retmax;

                // Build the e-summary url using the webenv and querykey.
                var querykey = body.esearchresult.querykey;
                var webenv = body.esearchresult.webenv;
                var summaryUrl = `${eUtilsBaseUrl}esummary.fcgi?db=PMC&query_key=${querykey}&WebEnv=${webenv}&retmode=json&retmax=20${apiKeyParam}`;

                // E-Summary request
                httpRequest(summaryUrl, {json: true}, (err, response, body) => {
                    if (err) {
                        return console.log(err);
                    }

                    // Add each returned item to the result object's item array
                    body.result.uids.forEach( (element) => {
                        results.items.push(body.result[element]);
                    });

                    // signal the caller that the results are ready
                    callback(results);
                });
            });
        }
    },

    fetchResultDetail: function (pmcId, callback) {
        let uri = `${eUtilsBaseUrl}efetch.fcgi?db=PMC&id=${pmcId}`;
        console.log(`fetching details at ${uri}`);
        httpRequest(uri, null, (err, response, body) => {
            console.log('error:', err); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body);
            callback(body);
        });
    }
}

module.exports = pubMedApi;
