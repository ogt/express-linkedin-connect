var request = require('supertest')
  , should = require('should')
  , express = require('express');

var env = {
    SESSION_SECRET : 'SECRET',
    LINKEDIN_API_KEY : 'ABC123',
    LINKEDIN_SECRET_KEY : 'secret',
    MONGO_URI : 'mongodb://localhost/express_linkedinin_connect_test'
};

function auth(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
}

describe('Testing express-linkedin-connect', function() {
    var db;
    before(function(done) {
      db = require('mongojs')
      .connect(env.MONGO_URI);

      done()
    });

    after(function(done) {
      db.close();
      done();
    });

    describe('Public Home', function () {
        it('should be accessible with no auth', function (done) {
            var app = express();
            app.use(express.urlencoded());
            app.use(express.methodOverride());
            app.use(express.cookieParser(env.SESSION_SECRET));
            app.use(express.session());
            require('../')(db, app, env); // require login

            app.get('/', function (req, res) {
                res.send('hey');
            })

            request(app)
            .get('/')
            .expect(200)
            .end(done)
        })
    })

    describe('Unauthorized access', function () {
        it('should return 302', function (done) {
            var app = express();
            app.use(express.urlencoded());
            app.use(express.methodOverride());
            app.use(express.cookieParser(env.SESSION_SECRET));
            app.use(express.session());
            require('../')(db, app, env); // require login

            app.get('/', function (req, res) {
                res.send('hey');
            })
            app.get('/private', auth, function (req, res) {
                res.send('wow');
            })

            request(app)
            .get('/private')
            .expect(302)
            .end(done)
        })
    })

});

