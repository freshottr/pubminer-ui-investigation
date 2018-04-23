let express = require("express");
let router = express.Router();
let pubMedQuery = require('../search');

router.get('/:pmid', (request, response) => {

    let pmid = request.params["pmid"]

    pubMedQuery.fetchResultDetail(pmid, (details) => {
        response.render('abstractSections', {"data": details});
    });
});

module.exports = router;
