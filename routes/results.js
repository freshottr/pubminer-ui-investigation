const router = require('express-promise-router')();
const pubSvc = require('../search');

const rowRequestSize = 20;

router.get('/', (request, response, next) => {

    return pubSvc.search(request.query)
        .then(qr => {
            return pubSvc
                .getSummaries(qr.webenv, qr.querykey, 0, rowRequestSize)
                .then(results => {
                    response.render('results', {
                        results: results,
                        qryResult: qr
                    });
                });
        });
});

router.get('/:webenv/:querykey', (req, res, next) => {

    // Get summaries for result rows
    return pubSvc
        .getSummaries(req.params.webenv, req.params.querykey, req.query.start, rowRequestSize)
        .then(results => {
            // Render the 'list' view using query results, if any
            res.render('resultRows', { "results": results });
        });
});

module.exports = router;
