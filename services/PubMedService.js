"use strict";

// TODO: remove this dependency here once it is being injected elsewhere
const http = require('request-promise');

/**
 * Provides high-level APIs for working with NCBI's E-utils HTTP APIs
 */
class PubMedService {

    /**
     * Constructs a new `PubMedService` backed by the provided HTTP client
     * and configuration.
     * @param client the http client user for making web requests
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
     * @param options
     * @param query the query string as entered by the user
     * @return
     */
    search(query, options) {
        const searchOptions = {
            uri: `${this.config.baseUri}${this.config.searchPath}`,
            json: true,
            qs: Object.assign({
                term: query,
                retmode: 'json',
                usehistory: 'y',
            }, options)
        };

        return this
            // E-search
            .client(searchOptions)
            .then(response => {
                return {
                    webenv: response.esearchresult.webenv,
                    querykey: response.esearchresult.querykey,
                    searchTerm: query,
                    itemsFound: response.esearchresult.count,
                    itemsReturned: response.esearchresult.retmax
                };
            })
            .catch(err => {
                console.error(`unexpected error executing PubMed Search or Link for ${query}`, err);
                return {
                    error: `Unexpected error executing PubMed Search for ${query}`
                };
            });
    }

    /**
     * Fetches the article summaries based on the provided `options`.
     * @param options
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
                retstart: options.start,
                retmax: options.max,
                retmode: "json"
            }
        };

        return this
            .client(summaryOptions)
            .catch(err => {
                console.error(`error (${err}) performing eSummary for ${JSON.stringify(summaryOptions)}`);
                return {
                    error: "Unexpected error executing PubMed Summary request"
                };
            });
    }

    /**
     * Fetches the article details for the given `articleId`. This method converts the raw XML
     * returned by `efetch` and converts it to `json`.
     * @param articleId
     * @param options
     */
    fetchArticleDetails(articleId, options) {
        return {
            error: 'fetchArticleDetails has not been implemented'
        };
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
