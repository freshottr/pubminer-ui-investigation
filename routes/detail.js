let express = require("express");
let router = express.Router();
let pubMedQuery = require('../search');

router.get('/:pmcId', (request, response) => {

    let pmcId = request.params["pmcId"]

    console.log(`fetching details for pmcId ${pmcId}`);

    pubMedQuery.fetchResultDetail(pmcId, (details) => {

        console.log(details);
        response.send(details);
        // Render the 'list' view using query results, if any
        // response.render('results', {"results": queryResult});
    });

});

module.exports = router;
