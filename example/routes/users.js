var express = require('express');
var router = express.Router();

// additions
function auth(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
}

/* GET users listing. */
router.get('/', auth, function(req, res) {
  res.send('respond with a resource');
});

module.exports = router;
