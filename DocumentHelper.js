"use strict";

const xmlSimple  = require('xml-simple');
const Errors     = require('./Errors');

class DocumentHelper {

    /**
     * Returns a map of the summary's `uid`s to IDs of type `idType`. `uid`s that
     * to not have a linked ID of type `idType` are removed from the result set.
     *
     * This method may raise an exception if the document is not in the expected
     * format.
     *
     * @param summaryDocument a JSON document as returned by `esummary` API
     * @param idType used as predicate filter on the articleids
     * @param xform a tranform function to apply to the linked ID
     * @return An object mapping the `uid` to the linked ID
     */
    static getLinkedIdsByType(summaryDocument, idType, xform) {
        return summaryDocument
            .result
            .uids
            .reduce((acc, uid) => {
                const linkedId = summaryDocument
                    .result[uid]
                    .articleids
                    .find(idObj => idObj.idtype === idType)

                if (linkedId) {
                    acc[uid] = xform(linkedId.value);
                }

                return acc;
            }, {});
    }

    static searchErrorResponse(query, error) {
        return {
            searchTerm: query,
            itemsFound: "0",
            itemsReturned: "0",
            error: error.message || 'An unexpected error occurred. Please try again.',
            severity: error.severity || Errors.Severity.Danger
        };
    }

    /**
     * Given a PubMed search result, extracts a simplified result
     * in canonical form for consumption by
     * @param searchDocument
     */
    static extractSearchResults(searchDocument, query) {
        try {
            return {
                webenv: searchDocument.esearchresult.webenv,
                querykey: searchDocument.esearchresult.querykey,
                searchTerm: query,
                itemsFound: searchDocument.esearchresult.count,
                itemsReturned: searchDocument.esearchresult.retmax
            };
        } catch (err) {
            console.error(`error extracting search results`, err);
            throw new Errors.InvalidDocumentFormatError(err);
        }
    }

    static extractEnvironmentFromLinkResults(linkDocument) {
        try {
            const lnkSet = linkDocument.linksets[0];
            return {
                webenv: lnkSet.webenv,
                querykey: lnkSet.linksetdbhistories[0].querykey
            }
        } catch (err) {
            console.error(`error extract env from link result`, err);
            throw new Errors.InvalidDocumentFormatError(err);
        }
    }

    static extractAbstract(detailDocument) {
        return DocumentHelper.convertXmlToJson(detailDocument)
            .then( json => {

                const abstract = json
                    .PubmedArticle
                    .MedlineCitation
                    .Article
                    .Abstract
                    .AbstractText;

                // The abstract can be an array of sections...
                if (Array.isArray(abstract)) {
                    let result = {};
                    abstract.forEach((abstractTxt) => {
                        result[abstractTxt['@'].Label.toLowerCase()] = abstractTxt['#'];
                    });
                    return result;

                // or an object...
                } else if (abstract && typeof abstract === 'object') {
                    return {
                        abstract: abstract['#']
                    };

                // or plain text
                } else {
                    return {
                        abstract: abstract
                    };
                }
            })
            .catch(err => {
                // TODO: log the pmid/pmcid of the document
                console.error(`error extracting abstract for detail document ${err}`, err);
                throw new Errors.InvalidDocumentFormatError(err);
            });
    }

    static convertXmlToJson(xmlDetailDocument) {
        return new Promise((resolve, reject) => {
            xmlSimple.parse(xmlDetailDocument, (err, parsed) => {
                if (err) {
                    reject(new Errors.InvalidDocumentFormatError(err));
                } else {
                    resolve(parsed);
                }
            });
        });
    }

}

module.exports = DocumentHelper;
