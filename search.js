// search.js
const config =  require('config');
const DocumentHelper = require('./DocumentHelper');
const QueryHelper = require('./QueryHelper');

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

let errorOf = (description) => {
  return {error: description};
};

let pubMedApi = {

    search : function(searchParams, callback) {

        let searchTerm = searchParams.searchTerm;
        let pubDateFilter = searchParams.pubDateFilter;

        if (QueryHelper.isEmptyTerm(searchTerm)) {
            // signal the caller that the (empty) results are ready
            callback({searchTerm: '', itemsFound: 0, itemsReturned: 0, items: []});
        } else {

            const queryTerms = [
                searchTerm,
                config.get('PubMedService').searchFilter,
                QueryHelper.getDateFilter(pubDateFilter)
            ];

            console.log(`calling esearch for ${searchTerm}...`);
            pmSvc.search(queryTerms, {
                db: 'pubmed',
            }).then(results => {
                console.log(`calling elink...`);
                return pmSvc.link({
                    db: 'pmc',
                    dbfrom: 'pubmed',
                    linkname: 'pubmed_pmc',
                    cmd: 'neighbor_history',
                    query_key: results.querykey,
                    WebEnv: results.webenv
                });
            }).then(linkResults => {
                console.log(`calling pmc esearch for open access articles...`);
                return pmSvc.search(['open access[filter]'], {
                    query_key: linkResults.querykey,
                    WebEnv: linkResults.webenv
                });
            }).then(pmcSearchResults => {
                //Override the search term
                pmcSearchResults.searchTerm = searchTerm;
                callback(pmcSearchResults);
            }).catch(err => {
                console.error(`error performing search ${err}`);
                callback(DocumentHelper.searchErrorResponse(searchTerm, err));
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
                console.log(`summaryResult ${JSON.stringify(summaryResults)}`);
                demoSvc
                    .getDemographicDetailsForIds(summaryResults.result.uids)
                    .then(demoDetails => {
                        const linkedIds = DocumentHelper
                            .getLinkedIdsByType(summaryResults, 'pmid', x => x);
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
                                //overwrite the uid with the pmid
                                item.uid = linkedIds[item.uid];
                                return item;
                            });
                    })
                    .then(mergedData => {
                        callback({items: mergedData})
                    });
            })
            .catch(err => {
                console.error(`unexpected error processing getSummaries ${err}`, err);
                callback(errorOf('unexpected error performing search'));
            });
    },

    fetchResultDetail: function (pmId, callback) {

        const options = {
            db: 'pubmed'
        };

        pmSvc.fetchArticleDetails(pmId, options)
            .then(results => callback(results))
            .catch(err => {
                console.log(`unable to get abstract for PMID ${pmId}`, err);
                return errorOf(`Unable to display abstract for PMID ${pmId}.`);
            });
    }
};

module.exports = pubMedApi;
