"use strict";

const AWS = require('aws-sdk');
const DocHelper = require('../DocumentHelper');
const Errors = require('../Errors');
const http = require('request-promise');

/**
 * Provides services for fetching demographic details for pubmed IDs
 */
class DemographicsService {

    /**
     * Constructs a new service backed by the AWS docClient
     */
    constructor(awsConfig, democonfig) {
        AWS.config.update(awsConfig);
        AWS.config.setPromisesDependency(null);
        this.docClient = new AWS.DynamoDB.DocumentClient();
        this.updateStats = {
            uri: `${democonfig.updateBaseUri}${democonfig.updateFilePath}`,
            json: true
        };
    }

    /**
     * Returns demographic details for the provided set of `pmcid`s.
     * @param pmcids an iterable of pubmed IDs
     * @return a `Promise` of demographic details keyed by `pmid`
     */
    getDemographicDetailsForIds(pmcids) {

        if (pmcids.length === 0) {
            console.warn("getDemographicDetailsForIds called with empty set of IDs");
            return Promise.resolve({});
        }

        const query = {
            RequestItems: {
                "demographics": {
                    ConsistentRead: false,
                    Keys: pmcids.map(id => ({ pmcid: id }))
                }
            }
        };

        return this
            .docClient
            .batchGet(query)
            .promise()
            .then(data => {
                return data
                .Responses
                .demographics
                /* jshint eqeqeq: false */
                .filter(item => item.errorStatus == null)
                /* jshint eqeqeq: true */
                .reduce((acc, item) => {
                    acc[item.pmcid] = {
                        pmcid: item.pmcid,
                        pmid: item.pmid,
                        table1: item.table1,
                        sentences: DocHelper
                            .groupSentencesBySection(item.sentences)
                            .map(sec => {
                                return {
                                    section: sec.section,
                                    text: sec.sentences.join(' ')
                                };
                            })
                            .filter(block => block.section.toLowerCase() !== 'abstract'),
                        dateProcessed: item.date_processed
                    };
                    return acc;
                }, {});
            })
            .catch( err => {
                console.log(`dynamo batchGet error: ${err.stack}`);
                throw new Errors.AppError(Errors.Severity.Danger, 'Internal error. Please try again.');
            });
    }

    /**
     * Returns statistics from the latest update to the demogrpahic database
     * @return a 'promise' of demographic update data
     */
    fetchLastDemoUpdate() {

        return http(this.updateStats)
            .then( data => {
                // convert and format the date as Month DD, YYYY
                try {
                    const options = {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        timeZone: "UTC"
                    };
                    data.formattedDateString = (new Date(data.update)).toLocaleDateString("en-US", options);
                } catch (err) {
                    data.formattedDateString = data.update;
                }

                // parse the total items as an integer and add locale-specific
                // formatting (e.g. comma separator)
                data.total_items = parseInt(data.total_items || 0).toLocaleString();

                return data;
            })
            .catch (err => {
                console.log(`error retrieving update statistics ${err.stack}`);
                throw new Errors.AppError(Errors.Severity.Warning, "Internal error. Please try again.");
            });
    }
}

module.exports = DemographicsService;
