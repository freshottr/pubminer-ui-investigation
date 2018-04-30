const router = require('express-promise-router')();
const pubSvc = require('../search');

router.get('/:pmid', (request, response, next) => {

    let pmid = request.params["pmid"]

    return pubSvc
        .fetchResultDetail(pmid)
        .then(details => {
            response.render('abstractSections', {"data": details});
        });
});

module.exports = router;
