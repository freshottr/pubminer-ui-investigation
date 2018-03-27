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
            //TODO: this query is fake aside from connecting to the database. make it real
            let q = `select ${id} as pmid, random() as male_perc, random() as female_perc from article limit 1;`;
            return this
                .session
                .query(q)
                .then( res => {
                    let row = res.rows[0];
                    let demoDetails = {
                        pmid: row.pmid,
                        malePercent: row.male_perc,
                        femalePercent: row.female_perc
                    };

                    console.log(`pmid: ${demoDetails.pmid} , male %: ${demoDetails.malePercent},` +
                        `female %: ${demoDetails.femalePercent}`);
                    return demoDetails;
                }, (err) => {
                    console.error(err);
                    reject(err);
                });
        };

        return ids.map(demoQueryForId);
    }
}

module.exports = DemographicsService;