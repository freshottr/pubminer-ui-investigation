"use strict";

const assert = require('assert');
const config = require('config');
const pubMedConfig = config.get('PubMedService');

describe('Configuration', function() {

    describe('PubMedService', function () {
        it('defines a valid baseUri', function () {
            assert.equal(pubMedConfig.baseUri,
                "https://eutils.ncbi.nlm.nih.gov");
        });

        it('defines a database', function (done) {
            if(pubMedConfig.db) {
                done();
            } else {
                done(new Error("dd not defined for PMS configuration"));
            }
        })
    });
});
