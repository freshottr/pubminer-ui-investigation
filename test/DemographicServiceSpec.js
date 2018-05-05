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


    describe('.fetchLastDemoUpdate', function() {
        it('returns statistics from the latest demographic database update' , function() {

            const awsS3Response = require('./data/statistics/update_stats.json');

            nock(`${demoConfig.updateBaseUri}`)
                .get(`${demoConfig.updateFilePath}`)
                .reply(200, awsS3Response);

            const response = demoSvc.fetchLastDemoUpdate();

            return response.then(result => {
                assert.equal(result.update, '2018-05-01');
                assert.equal(result.formattedDateString, 'May 1, 2018');
                assert.equal(result.total_items, "301,225");
                assert.equal(result.total_updates, 3359);
                assert.equal(result.with_sentences, 2);
                assert.equal(result.with_tables, 1010);
            });

        });
    });
});
