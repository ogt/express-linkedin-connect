Node module for linkedin-connect for express
--
[![Build Status](https://travis-ci.org/ogt/express-linkedin-connect.png)](https://travis-ci.org/ogt/express-linkedin-connect)

## Description

This module abstracts the boilerplate clode that you need to add to your express site when using the linkedin passport strategy.
It captures all the configuration elements in a single parameter, provides defaults to allow someone to use "login-via-linkedin" with the minimal possible code changes.

Here is how to use it with the default express demo code (this code is also include in the examples folder)

So lets see what changes are needed.
Create the default express app
```
> express example
```
Add your .env file that includes the linkedin api keys
```
> cat > .env
SESSION_SECRET=some_secret
LINKEDIN_API_KEY=ABC123
LINKEDIN_SECRET_KEY=secret
HOST=localhost:3000
PORT=3000
MONGOLAB_URI=local
^D
> 
```
and a Procfile_dev (be ready for pushing to heroku)
```
> cat > Procfile_dev
web: nodemon -e js,jade,css ./bin/www
^D
> foreman start -f Procfile_dev 
23:51:53 web.1  | started with pid 87597
23:51:54 web.1  | 11 Apr 23:51:54 - [nodemon] v1.0.14
23:51:54 web.1  | 11 Apr 23:51:54 - [nodemon] to restart at any time, enter `rs`
23:51:54 web.1  | 11 Apr 23:51:54 - [nodemon] watching: *.*
23:51:54 web.1  | 11 Apr 23:51:54 - [nodemon] starting `node ./bin/www`
```
So at this point we have this minimal express app that comes with two pages (`views/index.jade` and `views/users.jade`) and their corresponding routes.
For the purpose of this demononstration we will make the users page accessible to signedin users only, we will change a bit the `index` view to include a login link and we will create a variant of the index page ``views/home.jade` that is returned instead of the `index` when the user is signed in .

So we need to change the `app.js` code as follows:

![image](https://cloud.githubusercontent.com/assets/153419/2686590/cc29369a-c20f-11e3-8726-574a48b9b6cc.png)


And then change the routes:

![image](https://cloud.githubusercontent.com/assets/153419/2686591/d3f1fe5c-c20f-11e3-939b-07e2abdecb9e.png)
![image](https://cloud.githubusercontent.com/assets/153419/2686589/c37d32f8-c20f-11e3-8224-eade24a877fa.png)

add the private home that is rendered if a signedin person lands on `/`

![image](https://cloud.githubusercontent.com/assets/153419/2686024/e1a581c0-c1df-11e3-9ae2-cace308df7a6.png)

and modify the public `/` page to include the login link

![image](https://cloud.githubusercontent.com/assets/153419/2686025/e6a3125a-c1df-11e3-83aa-545636fcb99e.png)


and practically thats it.

The parameters of the function are :
 - db : the connected mongo db variable
 - app : the express app
 - env : the process environment following the naming convention above with all the variables included
 - cfg : optional configuration variables (see below).

The default cfg is :

```
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
```

Here is a brief description of the options:

- `linkedin_scope` : this a list of the scopes that will be requested by linkedin. You need to go to your app and edit its properties and chose the right scopes for your app. The `r_basicprofile`, `r_fullprofile`, `r_emailaddress` are the ones I have used in the past. Described in detail [here](https://developer.linkedin.com/documents/profile-fields). The scope is checked as part of the authentication.
- `linkedin_fields` : this is a list of the fields that will be requested from the API. Note that in the linkedin model these are not the names returned by the API, the represent at a higher level the attributes. E.g. the 'name' will results in various name-related fields coming back. The url above will give you a list of the fields allowed within the scope requested.
- `initProfile`, `updateProfile` : these are mapping function that you can define topick and chose which fields you want from the linkedin object returned upon auth. You almost always will need to change these functions to pick and chose the fields you want. There is a separate updateProfile function, because I found that during update I prefer to keep my fields - e.g. emailAddress - you may use linkedin's emailaddress as initial value - but the user may opted to change in your app... so you would rather not overwrite the emailAddress unless as part of the initial login.
- `redirects*`,`routes*` : these are there in case you have an opinion about these.
The only one I am typically changing is the `redirect_success` which is the url to land to on login.
- userdb_name : the name of the mongo collection used to store the user objects in.

## Installation 

Installing the module
```
npm install express-linkedin-connect
```
