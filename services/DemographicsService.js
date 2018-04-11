"use strict";

/**
 * Provides services for fetching demographic details for pubmed IDs
 */
class DemographicsService {

    /**
     * Constructs a new service backed by the AWS docClient
     */
    constructor(dbSession) {
        var AWS = require("aws-sdk");

        AWS.config.update({
          region: "us-east-1",
          endpoint: "https://dynamodb.us-east-1.amazonaws.com"
        });
        //AWS.config.setPromisesDependency(null);
        this.docClient = new AWS.DynamoDB.DocumentClient();
    }

    /**
     * Returns demographic details for the provided set of pubmed IDs.
     * @param ids an iterable of pubmed IDs
     * @return an iterable of `Promise`s of demographic details
     */
    getDemographicDetailsForIds(pmcid) {
        let demoQueryForId = (pmcid) => {
            return new Promise((resolve, reject) => {
                this.docClient.get(makeParamsFromPmcid(pmcid), function(err, data){
                    if (err) {
                        console.error("Unable to read item. Error: ", err);
                    } else {
                        //console.log("GetItem succeeded:", data)
                        if(data.Item){
	                        resolve({
	                            pmcid: data.Item.pmcid,
	                            pmid: data.Item.pmid,
	                            sentences: data.Item.sentences,
	                            date_processed: data.Item.date_processed
	                            })
	                    } else{
                            resolve({
								pmcid: null,
	                            pmid: null,
	                            sentences: null,
	                            date_processed: null

                            });
                        }                	
                        
                    }
                })
            });
        };
        return pmcid.map(demoQueryForId);
    }
}

/**
 * Returns a param object given a pubmed ID
 * @param pubmed ID
 * @return param object to be used to query DynamoDB
 */
function makeParamsFromPmcid(pmcid){

    // format for docClient.get(), referencing partition key (pmcid)
    var params = {
          TableName: "demographics",
          Key:{
              "pmcid": pmcid
          }
        };

    return(params);
}


module.exports = DemographicsService;
