const router = require('express-promise-router')();

router.get('/', (request, response) => {

    response.render('list');
});

module.exports = router;
