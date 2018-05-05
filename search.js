// search.js
const config = require('config');
const DocumentHelper = require('./DocumentHelper');
const QueryHelper = require('./QueryHelper');

const demoSvc = function () {
    const awsConfig = config.get('AwsConfig');
    const DemographicsService = require('./services/DemographicsService');
    return new DemographicsService(awsConfig);
}();

const pmSvc = function () {
    const pmConfig = config.get('PubMedService');
    const pmService = require('./services/PubMedService');
    return pmService.create(pmConfig);
}();

let pubMedApi = {

    search: function (searchParams) {

        let searchTerm = searchParams.searchTerm;
        let pubDateFilter = searchParams.pubDateFilter;

        const queryTerms = [
            searchTerm,
            config.get('PubMedService').searchFilter,
            QueryHelper.getDateFilter(pubDateFilter)
        ];

        console.log(`calling esearch for ${searchTerm}...`);

        return pmSvc
            .search(queryTerms, {
                db: 'pubmed',
            }, searchTerm)
            .then(results => {
                console.log(`calling elink...`);
                return pmSvc.link({
                    db: 'pmc',
                    dbfrom: 'pubmed',
                    linkname: 'pubmed_pmc',
                    cmd: 'neighbor_history',
                    query_key: results.querykey,
                    WebEnv: results.webenv
                });
            })
            .then(linkResults => {
                console.log(`calling pmc esearch for open access articles...`);
                return pmSvc
                    .search(['open access[filter]'], {
                        db: 'pmc',
                        query_key: linkResults.querykey,
                        WebEnv: linkResults.webenv
                    },
                    searchTerm); //override any enriched search term with the user search term
        });
    },

    getSummaries: function (webenv, querykey, start, max) {

        const environment = {
            webenv: webenv,
            querykey: querykey
        };

        const options = {
            max: max,
            start: start
        };

        return pmSvc
            .fetchSummary(environment, options)
            .then(summaryResults => {
                return demoSvc
                    .getDemographicDetailsForIds(summaryResults.result.uids)
                    .then(demoDetails => {
                        return {
                            items: DocumentHelper
                                .mergeDemographicAndSummaryResults(demoDetails, summaryResults)
                        };
                    });
            });
    },

    fetchResultDetail: function (pmId) {

        const options = {
            db: 'pubmed'
        };

        return pmSvc.fetchArticleDetails(pmId, options);
    },

    fetchLastDemoUpdate: function() {

        return demoSvc.fetchLastDemoUpdate();
    }

};

module.exports = pubMedApi;
