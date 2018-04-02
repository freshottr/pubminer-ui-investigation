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
    constructor(client, config) {
        this.client = http; ///client;
        this.config = config;
        this.config.queryFilter = "Therapy/Broad[filter]"; //TODO: move this to config
        this.searchUri = `${config.eUtilsBaseUri}/esearch.fcgi`;
        this.linkUri = `${config.eUtilsBaseri}/elink.fcgi`;
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
    search(options, query) {
        const searchOptions = {
            uri: this.searchUri,
            json: true,
            qs: {
                // TODO: use the API key in the query parameters
                db: this.config.db,
                term: `${query} AND ${this.config.queryFilter}`,
                retmode: "json",
                usehistory: "y",
            }
        };

        // DESNOTE(ismith, 2018-03-29): consider not calling the e-link API if we have 0 search results. This may only
        // be worthwhile if we feel that searches with 0 results will be a common occurrence
        return this
            // E-search
            .client(searchOptions)
            .then(response => {
                return {
                    // environment info for subsequent query
                    environment: {
                        webenv: response.esearchresult.webenv,
                        querykey: response.esearchresult.querykey
                    },
                    // partial query result
                    result: {
                        searchTerm: query,
                        itemsFound: response.esearchresult.count,
                        itemsReturned: response.esearchresult.retmax
                    }
                };
            })
            // E-link
            .then(searchResult => {
                const linkOptions = {
                    uri: this.linkUri,
                    json: true,
                    qs: {
                        db: "pmc",
                        retmode: "json",
                        cmd: "neighbor_history",
                        dbfrom: this.config.db,
                        linkname: "pubmed_pmc",
                        querykey: searchResult.environment.querykey,
                        webenv: searchResult.environment.webenv
                    }
                };
                return this.client(linkOptions)
                    .then(linkResult => {
                        // Update the querykey and webenv with updated valude from E-link
                        searchResult.webenv = linkResult.linksets[0].webenv;
                        searchResult.querykey = linkResult.linksets[0].linksetdbhistories[0].querykey;
                        return searchResult;
                    })
            })
            .catch(err => {
                console.error(`unexpected error executing PubMed Search or Link for ${query}`, err);
                return {
                    error: `Unexpected error executing PubMed Search or Link`
                };
            });
    }

    /**
     * Fetches the article summaries based on the provided `options`.
     * @param options
     * @return the summary for the article
     */
    fetchSummary(options) {

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
    static create(client, config){
        return this(client, config);
    }
}