"use strict";

/**
 * Provides services for fetching demographic details for pubmed IDs
 */
class DemographicsService {

    /**
     * Constructs a new service backed by the provided
     * `dbSession` database session
     * @param dbSession a connected database session
     */
    constructor(dbSession) {
        this.session = dbSession;
    }

    /**
     * Returns demographic details for the provided set of pubmed IDs.
     * @param ids an iterable of pubmed IDs
     * @return an iterable of `Promise`s of demographic details
     */
    getDemographicDetailsForIds(ids) {

        let demoQueryForId = (id) => {

            // TODO: replace with dynamoDB query
            return new Promise((resolve, reject) => {
                resolve({
                    pmid: id,
                    malePercent: 50,
                    femalePercent: 50
                });
            });
        };

        return ids.map(demoQueryForId);
    }
}

module.exports = DemographicsService;
