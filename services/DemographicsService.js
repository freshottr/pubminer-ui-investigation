"use strict";

const AWS = require('aws-sdk');

/**
 * Provides services for fetching demographic details for pubmed IDs
 */
class DemographicsService {

    /**
     * Constructs a new service backed by the AWS docClient
     */
    constructor(config) {
        AWS.config.update(config);
        AWS.config.setPromisesDependency(null);
        this.docClient = new AWS.DynamoDB.DocumentClient();
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
                .filter(item => item.errorStatus == null)
                .reduce((acc, item) => {
                    acc[item.pmcid] = {
                        pmcid: item.pmcid,
                        pmid: item.pmid,
                        table1: item.table1,
                        sentences: item.sentences,
                        date_process: item.date_processed
                    };
                    return acc;
                }, {});
            },
            err => {
                console.log(`dynamo batchGet error: ${err}`)
            });
    }
}

module.exports = DemographicsService;
