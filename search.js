// search.js
let httpRequest = require('request');
let xmlSimple   = require('xml-simple');
let demoSvc = function() {
    let psql = require('./db');
    let DemographicsService  = require('./services/DemographicsService');
    return new DemographicsService(psql);
}();
const config = require('config').get('PubMedService');
const pmSvc = require('./services/PubMedService').create(null, config);

// base url for all E-Utilities requests
const eUtilsBaseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';

let errorOf = (description) => {
  return {error: description};
};

let pubMedApi = {

    search : function(searchTerm, callback) {

        // setup the api key parameter if an api key is available.
        let apiKey = '';
        if (process.env.EUTILS_API_KEY) {
            apiKey = `&api_key=${process.env.EUTILS_API_KEY}`
        }

        // results object initialized with 'no results found' data
        var results = {searchTerm: '', itemsFound: 0, itemsReturned: 0, items: []};

        if (typeof searchTerm === "undefined" || searchTerm.trim().length === 0) {
            // signal the caller that the (empty) results are ready
            callback(results);

        } else {
            // E-Search request
            var db = "pubmed";
            var filter = "((randomized+controlled+trial[pt])+OR+(controlled+clinical+trial[pt])+OR+(randomized[tiab]+OR+randomised[tiab])+OR+(placebo[tiab])+OR+(drug+therapy[sh])+OR+(randomly[tiab])+OR+(trial[tiab])+OR+(groups[tiab]))+NOT+(animals[mh]+NOT+humans[mh])";
            var searchTermWithFilter = `(${filter}) AND (${searchTerm})`;
            var searchUrl = `${eUtilsBaseUrl}esearch.fcgi?db=${db}&term=${searchTermWithFilter}&retmode=json&usehistory=y${apiKey}`;
            httpRequest(searchUrl, {json: true}, (err, response, body) => {
                if (err) {
                    return console.log(err);
                }

                // populate the results object with the pieces we already know
                results.searchTerm = searchTerm;
                results.itemsFound = body.esearchresult.count;
                results.itemsReturned = body.esearchresult.retmax;
                results.webenv = body.esearchresult.webenv;
                results.querykey = body.esearchresult.querykey;

                // signal the caller that the results are ready
                callback(results);
            });
        }
    },

    getSummaries: function(webenv, querykey, start, max, callback) {

        // setup the api key parameter if an api key is available.
        let apiKey = '';
        if (process.env.EUTILS_API_KEY) {
            apiKey = `&api_key=${process.env.EUTILS_API_KEY}`
        }

        // Build the e-summary url using the webenv and querykey.
        var db = "pubmed";
        var summaryUrl = `${eUtilsBaseUrl}esummary.fcgi?db=${db}&query_key=${querykey}&WebEnv=${webenv}&retmode=json&retstart=${start}&retmax=${max}${apiKey}`;

        // E-Summary request
        const environment = {
            webenv: webenv,
            querykey: querykey
        };

        const options = {
            max: max,
            start: start
        };

        let results = {
            items: []
        };

        pmSvc.fetchSummary(environment, options)
            .then(summaryResults => {

                pmids = summaryResults.result.uids;
                pmcids = [];

                // digging pmcids out from results
                for (i = 0; i < pmids.length; i++) { 
                    for(j = 0; j < summaryResults.result[pmids[i]].articleids.length; j++){
                        if(summaryResults.result[pmids[i]].articleids[j].idtype == 'pmc'){
                            pmcids[i] = summaryResults.result[pmids[i]].articleids[j].value;
                        }
                    }
                } 

                // leaving only numeric values (stripping off 'PMC' from front)
                for (i = 0; i < pmcids.length; i++) {
                    if(pmcids[i]){
                        pmcids[i] = pmcids[i].replace(/\D/g, '');    
                    }
                } 

                // TODO: decide if things should just fall off if we don't return dynamo results for them
                Promise
                    .all(demoSvc.getDemographicDetailsForIds(pmcids))
                    .then(demoDetails => {
                        demoDetails.forEach(dd => {
                            //if demoDetails found, add all fields to item and push to results
                            if(dd){
                                let item = summaryResults.result[dd.pmid];
                                if(item){
                                    for(var prop in dd) item[prop] = dd[prop];
                                    results.items.push(item);                                       
                                }
                            }
                        });
                        return results;
                    })
                    .then(mergedData => callback(mergedData))
            });
    },

    fetchResultDetail: function (pmId, callback) {
        let uri = `${eUtilsBaseUrl}efetch.fcgi?db=pubmed&id=${pmId}&retmode=xml`;
        console.log(`fetching details for ${pmId} at ${uri}`);
        httpRequest(uri, null, (err, response, body) => {

            let result = {};

            if (err) {
                console.log(`error fetching details for ${pmId}`, err);
                result.error = "failed to get publication details";
                return;
            }

            console.log('body:', body); // TODO: remove verbose logging later

            // extract the abstracts from result details
            xmlSimple.parse(body, (err, parsed) => {
                if (err) {
                    console.log(`failed to parse ${err}`);
                    result = errorOf("unable to parse publication details");
                    return;
                }

                try {

                    let abstract = parsed
                         .PubmedArticle
                         .MedlineCitation
                         .Article
                         .Abstract
                         .AbstractText;

                    // The abstract can be an array of sections...
                    if (Array.isArray(abstract)) {
                         abstract.forEach((abstractTxt) => {
                             console.log(abstractTxt['@'].Label); // the abstract type
                             console.log(abstractTxt['#']); // the abstract's text
                             result[abstractTxt['@'].Label.toLowerCase()] = abstractTxt['#'];
                         });
                    // ... or an object
                    } else if (abstract && typeof abstract == 'object'){
                        result["abstract"] = abstract['#'];
                    // ... or plain text
                    } else {
                        result["abstract"] = abstract;
                    }
                }
                catch(e) {
                    console.log(`error extracting the abstract's text from the document ${e}`);
                    result.error = "unexpected document format";
                }
            });

            callback(result);
        });
    }
};

module.exports = pubMedApi;
