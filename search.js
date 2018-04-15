// search.js
const httpRequest = require('request');
const xmlSimple   = require('xml-simple');
const config =  require('config');

const demoSvc = function() {
    const awsConfig = config.get('AwsConfig')
    const DemographicsService  = require('./services/DemographicsService');
    return new DemographicsService(awsConfig);
}();

const pmSvc = function() {
    const pmConfig = config.get('PubMedService');
    const pmService = require('./services/PubMedService');
    return pmService.create(pmConfig);
}();

// base url for all E-Utilities requests
const eUtilsBaseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';

let errorOf = (description) => {
  return {error: description};
};

let pubMedApi = {

    search : function(searchTerm, callback) {

        if (typeof searchTerm === "undefined" || searchTerm.trim().length === 0) {
            // signal the caller that the (empty) results are ready
            callback({searchTerm: '', itemsFound: 0, itemsReturned: 0, items: []});

        } else {
            // E-Search request
            const query = `(${config.get('PubMedService').searchFilter}) AND (${searchTerm})`;
            pmSvc.search(query, {
                db: 'pubmed',
            }).then(results => {
                results.searchTerm = searchTerm;
                callback(results)
            });
        }
    },

    getSummaries: function(webenv, querykey, start, max, callback) {

        const environment = {
            webenv: webenv,
            querykey: querykey
        };

        const options = {
            max: max,
            start: start
        };

        pmSvc.fetchSummary(environment, options)
            .then(summaryResults => {
                const pmcids = [].concat.apply([], summaryResults
                    .result
                    .uids
                    .map(uid => summaryResults
                        .result[uid]
                        .articleids
                        .filter(idObj => idObj.idtype === 'pmc')
                        .map(pmcid => {
                            return {
                                pmid: uid,
                                pmcid: pmcid.value.replace(/\D/g, '')
                            }
                        })
                    )
                );

                demoSvc
                    .getDemographicDetailsForIds(pmcids.map(kv => kv.pmcid))
                    .then(demoDetails => {
                        return summaryResults
                            .result
                            .uids
                            .map(resultItem => {
                                let item = summaryResults.result[resultItem];
                                if (demoDetails[resultItem]) {
                                    // TODO: copy the whole object instead of each attribute
                                    // e.g. item.dd = demoDetails[resultItem];
                                    for (let att in demoDetails[resultItem]) {
                                        item[att] = demoDetails[resultItem][att];
                                    }
                                }
                                return item;
                            });
                    })
                    .then(mergedData => callback({items: mergedData}))
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
