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

    describe('.groupSentencesBySection', function () {

        it('handles undefined arrays', function () {
            const grouped = DocHelper.groupSentencesBySection(null);
            assert.strictEqual(grouped.length, 0);
        });

        it('handles empty arrays', function () {
            const grouped = DocHelper.groupSentencesBySection([]);
            assert.strictEqual(grouped.length, 0);
        });

        it('keeps stable order of grouped sections', function () {
            const sections = [1, 2, 1, 3, 2, 4].map(x => 'sec' + x);
            const texts = sections.map((sec, idx) => `text ${idx} for ${sec}`);
            const sentences = sections.map((s, idx) => {
               return {
                   section: s,
                   text: texts[idx]
               }
            });

            const grouped = DocHelper.groupSentencesBySection(sentences);
            assert.strictEqual(grouped.length, 4);
            assert.strictEqual(grouped[0].sentences.length, 2);
            assert.strictEqual(grouped[1].sentences.length, 2);
            assert.strictEqual(grouped[2].sentences.length, 1);
            assert.strictEqual(grouped[3].sentences.length, 1);
        });

        it('keeps a stable ordering of sentences', function () {
            const sections = [1, 2, 1, 3, 2, 4].map(x => 'sec' + x);
            const texts = sections.map((sec, idx) => `text ${idx} for ${sec}`);
            const sentences = sections.map((s, idx) => {
                return {
                    section: s,
                    text: texts[idx]
                }
            });

            const grouped = DocHelper.groupSentencesBySection(sentences);
            assert.strictEqual(grouped.length, 4);

            const sec1Sentences = grouped[0].sentences;

            var lastIdx = -1;
            sec1Sentences.forEach(sentence => {
                let idx = texts.indexOf(sentence);
                assert.strictEqual(idx > lastIdx, true);
                lastIdx = idx;
            });

            const sec2Sentences = grouped[1].sentences;
            var lastIdx = -1;
            sec2Sentences.forEach(sentence => {
                let idx = texts.indexOf(sentence);
                assert.strictEqual(idx > lastIdx, true);
                lastIdx = idx;
            });
        });


    });


    //TODO: add tests for other `DocumentHelper` methods

});
