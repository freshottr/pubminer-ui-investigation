var express = require("express");
var router = express.Router();

router.get('/', (request, response) => {
    // Render the 'list' view using the app.locals data 'reportsDB'
    response.render('list', {"searchTerm": request.app.locals.searchTerm,
                             "count": request.app.locals.resultCount,
                             "results": request.app.locals.results});
});

module.exports = router;
