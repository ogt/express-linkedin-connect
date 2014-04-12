
/*
 * GET home page.
 */

exports.index = function(req, res){
    if (!req.isAuthenticated()) {
        res.render( 'index', { title: 'Express' });
    }
    else {
        res.render('home',
            { title: 'Express - User Home Page', user : req.user.firstName } 
        );
    }
};
