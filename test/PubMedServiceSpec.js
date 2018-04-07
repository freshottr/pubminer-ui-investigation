"use strict";

const assert = require('assert');
const config = require('config');
const nock = require('nock');
const pubMedConfig = config.get('PubMedService');
const pubMedSvc = require('../services/PubMedService');


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

           const pms = new pubMedSvc(null, pubMedConfig);
           const response = pms.search(null, searchTerm);

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
});
