"use strict";

const assert = require('assert');
const config = require('config');
const nock = require('nock');
const pubMedConfig = config.get('PubMedService');
const pmSvc = require('../services/PubMedService').create(null, pubMedConfig);


describe('PubMedService', function() {
    describe('search', function () {
       it('should return results for a search term', function () {
           const searchTerm = 'zika';
           const pubMedSearchResponse = require('./data/search/pubmed_search_success.json');
               const pmMock = nock(`${pubMedConfig.baseUri}`)
                   .get(`${pubMedConfig.searchPath}`)
                   .query({
                       db: `${pubMedConfig.db}`,
                       term: `(${searchTerm}) AND (${pubMedConfig.searchFilter})`,
                       retmode: "json",
                       usehistory: "y"
                   })
                   .reply(200, pubMedSearchResponse);

           const response = pmSvc.search(null, searchTerm);

           return response.then( result => {
               console.log(`processing response ${JSON.stringify(result)}`);

               assert.equal(
                   result.environment.webenv,
                   pubMedSearchResponse.esearchresult.webenv);

               assert.equal(
                   result.environment.querykey,
                   pubMedSearchResponse.esearchresult.querykey);

               assert.equal(
                   result.result.searchTerm,
                   searchTerm);

               assert.equal(result.result.itemsFound,
                   pubMedSearchResponse.esearchresult.count);

               assert.equal(result.result.itemsReturned,
                   pubMedSearchResponse.esearchresult.retmax);

           });
       });
    });

    describe('fetchSummary', function () {
        it('should return summary results', function () {
            const pubMedSummaryResponse = require('./data/summary/pubmed-esummary-success');

            const environment = {
                webenv: "NCID_1_55158906_130.14.22.215_9001_1523239706_395425780_0MetA0_S_Mega",
                querykey: "1"
            };

            const options = {
                start: 0,
                max: 3,
            };

            const pmMock = nock(`${pubMedConfig.baseUri}`)
                .get(`${pubMedConfig.summaryPath}`)
                .query({
                    db: `${pubMedConfig.db}`,
                    retmax: options.max,
                    retstart: options.start,
                    WebEnv: environment.webenv,
                    query_key: environment.querykey,
                    retmode: "json"
                })
                .reply(200, pubMedSummaryResponse);

            const response = pmSvc.fetchSummary(environment, options);

            return response.then(result => {
                assert.equal(result.result.uids[0], '29603827');
                assert.equal(result.result.uids[1], '29489680');
                assert.equal(result.result.uids[2], '29390338');
            });

        });
    });
});
