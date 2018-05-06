"use strict";

const assert = require('assert');
const nock = require('nock');
const config = require('config');
const demoConfig = config.get('DemographicsService');

const demoSvc = function () {
    const awsConfig = config.get('AwsConfig');
    const DemographicsService = require('../services/DemographicsService');
    return new DemographicsService(awsConfig, demoConfig);
}();


describe('DemographicService', function () {

    describe('.fetchLastDemoUpdate', function () {
        it('returns statistics from the latest demographic database update', function () {

            const awsS3Response = require('./data/statistics/update_stats.json');

            nock(`${demoConfig.updateBaseUri}`)
                .get(`${demoConfig.updateFilePath}`)
                .reply(200, awsS3Response);

            return demoSvc
                .fetchLastDemoUpdate()
                .then(result => {
                    assert.equal(result.update, '2018-05-01');
                    assert.equal(result.formattedDateString, 'May 1, 2018');
                    assert.equal(result.total_items, "301,225");
                    assert.equal(result.total_updates, 3359);
                    assert.equal(result.with_sentences, 2);
                    assert.equal(result.with_tables, 1010);
                });
        });

    });

    describe('.getDemographicDetailsForIds', function () {
        it('returns IDs', function () {
            demoSvc.docClient.batchGet = function (query) {
                const records = query
                    .RequestItems
                    .demographics
                    .Keys
                    .map(key => {
                        return {
                            pmcid: key.pmcid,
                            pmid: key.pmcid,
                            table1: null,
                            errorStatus: null,
                            sentences: [{
                                section: "introduction",
                                text: "asfasfasfasf"
                            }]
                        };
                    });

                return {
                    promise: function () {
                        return Promise.resolve({
                            Responses: {
                                demographics: records
                            }
                        });
                    }
                };
            };

            return demoSvc
                .getDemographicDetailsForIds(["123", "456"])
                .then(result => {
                    assert.strictEqual(result['123'].pmcid, '123');
                    assert.strictEqual(result['456'].pmcid, '456');
                });
        });
    });
});
