let express = require("express");
let router = express.Router();
let pubMedQuery = require('../search');

router.get('/:pmcId', (request, response) => {

    let pmcId = request.params["pmcId"]

    console.log(`fetching details for pmcId ${pmcId}`);

    pubMedQuery.fetchResultDetail(pmcId, (details) => {

        console.log(details);
        // TODO: render a proper view/template here
        response.send(details);
    });

});

module.exports = router;
