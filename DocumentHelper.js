"use strict";

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
}

module.exports = DocumentHelper;
