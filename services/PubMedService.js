"use strict";

const http = require('request-promise');
const DocHelper = require('../DocumentHelper');
const QueryHelper = require('../QueryHelper');
const Errors = require('../Errors');

/**
 * Provides high-level APIs for working with NCBI's E-utils HTTP APIs
 */
class PubMedService {

    /**
     * Constructs a new `PubMedService` backed by the provided HTTP client
     * and configuration.
     * @param config the configuration
     */
    constructor(config) {
        this.client = http;
        this.config = config;
    }

    /**
     * Returns high-level information on search results that includes the
     * `webenv` and `querykey` for subsequent (summary) requests. It also
     * includes the total number of results.
     *
     * @param queryTerms And Array of terms to query
     * @param options additional query parameters to be included with the request
     * @return
     */
    search(queryTerms, options) {

        const searchOptions = {
            uri: `${this.config.baseUri}${this.config.searchPath}`,
            json: true,
            qs: Object.assign({
                term: QueryHelper.combineSearchTerms(queryTerms),
                retmode: 'json',
                usehistory: 'y',
            }, options)
        };

        return this
            // E-search
            .client(searchOptions)
            .then(response => {
                const searchResult = DocHelper.extractSearchResults(response, queryTerms[0]);
                console.log(`esearch found ${searchResult.itemsFound} for ${queryTerms[0]}`);
                if (searchResult.itemsFound === "0") {
                    throw new Errors.EmptySearchResultError(queryTerms[0]);
                }
                return searchResult;
            })
    }

    link(options) {

        const linkOptions = {
            uri: `${this.config.baseUri}${this.config.elinkPath}`,
            json: true,
            qs: Object.assign({
                retmode: 'json',
                usehistory: 'y',
            }, options)
        };

        return this
            .client(linkOptions)
            .then(response => {
                console.log(`processing elink result`);
                return DocHelper
                    .extractEnvironmentFromLinkResults(response);
            })
    }

    /**
     * Fetches the article summaries based on the provided `options`.
     * @param environment the `WebEnv` and `query_key` values
     * @param options optional query parameters
     * @return the summary for the article
     */
    fetchSummary(environment, options) {
        const summaryOptions = {
            uri: `${this.config.baseUri}${this.config.summaryPath}`,
            json: true,
            qs: {
                // TODO: use the API key in the query parameters
                db: this.config.db,
                WebEnv: environment.webenv,
                query_key: environment.querykey,
                retstart: options.start || 0,
                retmax: options.max || 20, // TODO: use config value here
                retmode: "json"
            }
        };

        return this
            .client(summaryOptions)
            .catch(err => {
                console.error(`error (${err}) performing eSummary for ${JSON.stringify(summaryOptions)}`);
                throw err;
            });
    }

    /**
     * Fetches the article details for the given `articleId`. This method converts the raw XML
     * returned by `efetch` and converts it to `json`.
     * @param articleId
     * @param options
     * @return an object with an `abstract` attribute
     */
    fetchArticleDetails(articleId, options) {
        const fetchOptions = {
            uri: `${this.config.baseUri}${this.config.efetchPath}`,
            json: true,
            qs: Object.assign({
                retmode: 'xml',
                id: articleId
            }, options)
        };

        console.log(`fetching details for ${articleId}`);

        return this.client(fetchOptions)
            .then(doc => DocHelper.extractAbstract(doc));
    }

    /**
     * Factory method for creating a new `PubMedService`
     * @param client the client
     * @param config the configuration
     * @return a new `PubMedService`
     */
    static create(config){
        return new this(config);
    }
}

module.exports = PubMedService;
