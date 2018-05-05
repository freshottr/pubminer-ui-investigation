const router = require('express-promise-router')();
const pubMedQuery = require('../search');

router.get('/', (request, response) => {
    /* jshint unused: vars */
    return pubMedQuery.fetchLastDemoUpdate()
        .then(update => {
            response.render('list', {"metadata": update});
    });
});

module.exports = router;
