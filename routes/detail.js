let express = require("express");
let router = express.Router();
let pubMedQuery = require('../search');

router.get('/:pmcId', (request, response) => {

    let pmcId = request.params["pmcId"]

    pubMedQuery.fetchResultDetail(pmcId, (details) => {
        response.render('abstractSections', {"data": details});
    });
});

module.exports = router;
