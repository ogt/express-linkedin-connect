var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    if (!req.isAuthenticated()) {
        res.render( 'index', { title: 'Express' });
    }
    else {
        res.render('home',
            { title: 'Express - User Home Page', user : req.user.firstName }
        );
    }
});

module.exports = router;
