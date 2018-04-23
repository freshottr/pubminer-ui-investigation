"use strict";

const assert = require('assert');
const DocHelper = require('../DocumentHelper');
const fs = require('fs');
const fsOptions = {
    encoding: 'utf-8',
    flag: 'r'
};

describe('DocumentHelper', function () {

    describe('.extractAbstract', function () {

        it('returns text for simple text abstract', function () {
            const xml = fs.readFileSync('./test/data/detail/efetch.xml', fsOptions);
            const abstract = DocHelper.extractAbstract(xml);
            return abstract.then(abs => {
                assert.strictEqual(abs.abstract,
                    'Anti-glycolipid antibodies are key to revealing the pathomechanisms');
            });
        });

        // TODO: more testing of `extractAbstract` with different document formats

    });


    describe('.getLinkedIdsByType', function () {

        it('returns a map of uids to id-type', function () {

        });

        it('removes IDs without the linked ID type from the result', function () {

        });

    });

    describe('.mergeDemographicAndSummaryResults', function () {

        it('returns all items from the summary in the same order', function () {

        });

        it('includes demographic details where available', function () {

        });

        it('returns the expected attributes for each item', function () {

        });

    });


    //TODO: add tests for other `DocumentHelper` methods

});
