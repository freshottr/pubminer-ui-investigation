"use strict";

const assert = require('assert');
const QueryHelper = require('../QueryHelper');

describe('QueryTermHelper', function () {
    describe('.isEmpty', function () {

        it('returns true for undefined', function () {
            assert.strictEqual(QueryHelper.isEmptyTerm(null), true);
        });

        it('returns true for empty string', function () {
            assert.strictEqual(QueryHelper.isEmptyTerm(""), true);
        });

        it('returns true for non-string', function () {
            assert.strictEqual(QueryHelper.isEmptyTerm(["hello"]), true);
        });

        it('returns false for non-empty string', function () {
            assert.strictEqual(QueryHelper.isEmptyTerm("not empty"), false);
        });
    });

    describe('.getDateFilter', function () {


        it('returns empty string for 0', function () {
            assert.strictEqual(QueryHelper.getDateFilter('0'), "");
        });

        it('returns empty string undefined value', function () {
            assert.strictEqual(QueryHelper.getDateFilter(undefined), "");
        });

        it('returns empty string unsupported value', function () {
            assert.strictEqual(QueryHelper.getDateFilter("5"), "");
        });

        it('returns expected term for a valid value', function () {
            ["1", "2", "3"].forEach(value => {
                const pattern = `^"last ${value} years"\\[PDat\\]$`;
                const regex = new RegExp(pattern);
                assert.strictEqual(regex.test(QueryHelper.getDateFilter(value)), true);
            });
        });
    });

    describe('.combineSearchTerms', function () {

        it('returns a provided string unchanged', function () {
            const nonArrayTerm = 'xyz';
            const combinedTerms = QueryHelper.combineSearchTerms(nonArrayTerm);
            assert.strictEqual(combinedTerms, nonArrayTerm);
        });

        it('returns the single item in an array unchanged', function () {
            const singleArrayTerm = ['xyz'];
            const combinedTerms = QueryHelper.combineSearchTerms(singleArrayTerm);
            assert.strictEqual(combinedTerms, singleArrayTerm[0]);
        });

        it('removes empty terms', function () {
            const term = 'xyz'
            const combinedTerms = QueryHelper.combineSearchTerms(['', term, null]);
            assert.strictEqual(combinedTerms, term);
        });

        it('combines two terms', function () {
            const terms = ['xyz', 'abc'];
            const combinedTerms = QueryHelper.combineSearchTerms(terms);
            assert.strictEqual(combinedTerms, `(${terms[0]}) AND (${terms[1]})`);
        });

        it('combines multiple terms', function () {
            const terms = ['xyz', 'abc', 'def'];
            const combinedTerms = QueryHelper.combineSearchTerms(terms);
            assert.strictEqual(combinedTerms, `(${terms[0]}) AND (${terms[1]}) AND (${terms[2]})`);
        });

    });
});

