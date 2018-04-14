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
     * Returns demographic details for the provided set of pubmed IDs.
     * @param ids an iterable of pubmed IDs
     * @return an iterable of `Promise`s of demographic details
     */
    getDemographicDetailsForIds(pmcids) {

        const query = {
            RequestItems: {
                "demographics": {
                    ConsistentRead: false,
                    Keys: pmcids
                        .filter(id => id != null)
                        .map(id => ({ pmcid: id }))
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
                    console.log(`got ${JSON.stringify(item)} from DB`);
                    acc[item.pmid] = {
                        pmcid: item.pmcid,
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
