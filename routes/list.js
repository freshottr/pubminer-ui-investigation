const router = require('express-promise-router')();
const pubMedQuery = require('../search');

router.get('/', (request, response) => {

    return pubMedQuery.fetchLastDemoUpdate()
        .then(update => {
            response.render('list', {"metadata": update});
    });
});

module.exports = router;
