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
> express --sessions example
> ls example
./             app.js        package.json  routes/
../            node_modules/ public/       views/
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
web: nodemon -e js,ejs,css app.js 
^D
> foreman start -f Procfile_dev 
16:33:46 web.1  | started with pid 77766
16:33:46 web.1  | 11 Apr 16:33:46 - [nodemon] v1.0.14
16:33:46 web.1  | 11 Apr 16:33:46 - [nodemon] to restart at any time, enter `rs`
16:33:46 web.1  | 11 Apr 16:33:46 - [nodemon] watching: *.*
16:33:46 web.1  | 11 Apr 16:33:46 - [nodemon] starting `node app.js`
16:33:47 web.1  | Express server listening on port 3000
```
So at this point we have this minimal express app that comes with two pages (`views/index.jade` and `views/users.jade`) and their corresponding routes.
For the purpose of this demononstration we will make the users page accessible to signedin users only, we will change a bit the `index` view to include a login link and we will create a variant of the index page ``views/home.jade` that is returned instead of the `index` when the user is signed in .

So we need to change the `app.js` code as follows:

![image](https://cloud.githubusercontent.com/assets/153419/2686021/d5986168-c1df-11e3-84b9-e5e429ced238.png)

And then change the routes:

![image](https://cloud.githubusercontent.com/assets/153419/2686023/db893e1c-c1df-11e3-9c8b-674280947c04.png)

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
