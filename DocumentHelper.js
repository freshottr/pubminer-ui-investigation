"use strict";

class DocumentHelper {

    /**
     * Returns the Given an `e-utils` summary document with results
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

                acc[uid] = xform(linkedId.value);
                return acc;
            }, {});
    }
}

module.exports = DocumentHelper;
