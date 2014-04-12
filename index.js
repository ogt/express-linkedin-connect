var _ = require('glutils');
var passport = require('passport');
var uuid = require('uuid-encoded');

var defaultCfg = {
    linkedin_scope : ['r_basicprofile' ],
    linkedin_fields : [ 'name', 'picture-url','public-profile-url','headline' ],
    initProfile : function(profile) {
        return _.pick(profile._json,'firstName','lastName','pictureUrl',
            'publicProfileUrl','headline');
    },
    updateProfile : null, //updated below
    redirects_success : '/',
    redirects_logout : '/',
    redirects_failure : '/',
    routes_login : '/login',
    routes_logout : '/logout',
    routes_logincallback : '/login/callback',
    userdb_name : 'users'
};
defaultCfg.updateProfile = defaultCfg.initProfile;

module.exports = function (db, app, env, cfg) {
    cfg = _.merge(defaultCfg,cfg);

    var host = env.HOST,
            OAuthStrategy = require('passport-linkedin').Strategy;

    passport.use('linkedin', new OAuthStrategy({
            consumerKey: env.LINKEDIN_API_KEY,
            consumerSecret: env.LINKEDIN_SECRET_KEY,
            callbackURL: 'http://'+host+cfg.routes_logincallback,
            profileFields: _.listAdd(cfg.linkedin_fields, 'id')
        },
        function(token, tokenSecret, profile, done) {
            var prof = profile._json;
            var user = { 
                _accessToken : token,
                _accessTokenSecret : tokenSecret,
                _linkedinid : prof.id
            };
            var userdb = db.collection(cfg.userdb_name);
            userdb.ensureIndex( { _linkedinid: 1}, { unique: true });
            userdb.find({_linkedinid : prof.id }, function(err,users){
                user = _.merge(
                    users.length > 0 ?
                        cfg.updateProfile(profile) :
                        cfg.initProfile(profile),
                    user
                );
                user._id = users.length > 0 ?  users[0]._id : uuid();
                userdb.update({_id : user._id }, 
                    { $set : _.omit(user,'_id') }, { upsert : true },
                    function(err) {
                        done(err,user);
                    }
                );
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        db.collection(cfg.userdb_name).findOne({ _id : id }, function (err, data) {
            if (err) return done(err);
            done(null, data);
        });
    });

    app.use(passport.initialize());
    app.use(passport.session());

    app.get(cfg.routes_login,
        passport.authenticate('linkedin'), function(){}
    );

    app.get(cfg.routes_logincallback,
        passport.authenticate('linkedin', {
            failureRedirect: cfg.redirects_failure, scope: cfg.linkedin_scope
        }),
        function(req, res) {
            res.redirect(cfg.redirects_success);
        }
    );

    app.get(cfg.routes_logout, function(req, res){
        req.logout();
        res.redirect(cfg.redirects_logout);
    });
};
