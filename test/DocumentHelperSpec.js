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

        it('return text for simple text abstract', function () {
            const xml = fs.readFileSync('./test/data/detail/efetch.xml', fsOptions);
            const abstract = DocHelper.extractAbstract(xml);
            return abstract.then(abs => {
                assert.strictEqual(abs.abstract,
                    'Anti-glycolipid antibodies are key to revealing the pathomechanisms');
            });
        });

        // TODO: more testing of `extractAbstract` with different document formats

    });


    //TODO: add tests for other `DocumentHelper` methods

});
