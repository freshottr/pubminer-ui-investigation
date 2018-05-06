"use strict";

const assert = require('assert');
const config = require('config');
const nock = require('nock');
const pubMedConfig = config.get('PubMedService');
const pmSvc = require('../services/PubMedService').create(pubMedConfig);

describe('PubMedService', function () {

    describe('.search', function () {

        function mockSearchResponse(searchTerm, queryOptions, mockData, status) {
            status = status || 200;
            nock(`${pubMedConfig.baseUri}`)
                .get(`${pubMedConfig.searchPath}`)
                .query(Object.assign({
                    retmode: "json",
                    usehistory: "y",
                    term: searchTerm
                }, queryOptions))
                .reply(status, mockData);
        }


        it('returns results for a search term', function () {
            const pubMedSearchResponse = require('./data/search/pubmed_search_success.json');
            const searchTerm = 'zika';
            const queryOptions = {
                db: 'pubmed'
            };

            mockSearchResponse(searchTerm, queryOptions, pubMedSearchResponse);

            const response = pmSvc.search([searchTerm], queryOptions);

            return response.then(result => {

                assert.equal(
                    result.webenv,
                    pubMedSearchResponse.esearchresult.webenv);

                assert.equal(
                    result.querykey,
                    pubMedSearchResponse.esearchresult.querykey);

                assert.equal(
                    result.searchTerm,
                    searchTerm);

                assert.equal(result.itemsFound,
                    pubMedSearchResponse.esearchresult.count);

                assert.equal(result.itemsReturned,
                    pubMedSearchResponse.esearchresult.retmax);

            });
        });

        it('returns an EmptySearchResultError for 0 items returned', function (done) {
            const pubMedSearchResponse = require('./data/search/pubmed_search_zero_results.json');
            const searchTerm = 'zika';
            const queryOptions = {
                db: 'pubmed'
            };

            mockSearchResponse(searchTerm, queryOptions, pubMedSearchResponse);

            const response = pmSvc.search([searchTerm], queryOptions, searchTerm);

            response.then(x => {
                assert.fail(x, "", "expected failed Promise");
            }).catch(err => {
                assert.strictEqual(err.constructor.name,
                    'EmptySearchResultError');
                done();
            });
        });

        it('returns a TooManyResultsError for more than `resultsLimit` items returned', function () {
            const pubMedSearchResponse = require('./data/search/pubmed_search_too_many_results.json');
            const searchTerm = 'zika';
            const queryOptions = {
                db: 'pubmed'
            };

            mockSearchResponse(searchTerm, queryOptions, pubMedSearchResponse);

            const response = pmSvc.search([searchTerm], queryOptions, searchTerm);

            return response.then(x => {
                assert.fail(x, "", "expected failed Promise");
            }).catch(err => {
                assert.strictEqual(err.constructor.name, 'TooManyResultsError');
            });
        });

        it('returns InvalidQueryStringError for an empty query string', function () {
            const searchTerm = '';
            const response = pmSvc.search([searchTerm], {});

            return response.then(x => {
                assert.fail(x, "", "expected failed Promise");
            }).catch(err => {
                assert.strictEqual(err.constructor.name,
                    'InvalidQueryStringError');
            });
        });


        it('returns InvalidQueryStringError for an undefined query string', function () {
            const searchTerm = null;
            const response = pmSvc.search([searchTerm], {});

            return response.then(x => {
                assert.fail(x, "", "expected failed Promise");
            }).catch(err => {
                assert.strictEqual(err.constructor.name,
                    'InvalidQueryStringError');
            });
        });

        it('returns InvalidQueryStringError for an whitespace query string', function () {
            const searchTerm = '       ';
            const response = pmSvc.search([searchTerm], {});

            return response.then(x => {
                assert.fail(x, "", "expected failed Promise");
            }).catch(err => {
                assert.strictEqual(err.constructor.name,
                    'InvalidQueryStringError');
            });
        });

    });

    describe('.fetchSummary', function () {
        it('returns summary results', function () {
            const pubMedSummaryResponse = require('./data/summary/pubmed-esummary-success');

            const environment = {
                webenv: "NCID_1_55158906_130.14.22.215_9001_1523239706_395425780_0MetA0_S_Mega",
                querykey: "1"
            };

            const options = {
                db: 'pmc',
                start: 0,
                max: 3,
            };

            nock(`${pubMedConfig.baseUri}`)
                .get(`${pubMedConfig.summaryPath}`)
                .query({
                    db: 'pmc',
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
