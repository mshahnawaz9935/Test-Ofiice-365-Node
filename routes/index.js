
var express = require('express');
var router = express.Router();
var authHelper = require('../authHelper.js');
 var requestUtil = require('../requestUtil.js');
 var https = require ('https');

/* GET home page. */
router.get('/', function (req, res) {
  // check for token
  if (req.cookies.REFRESH_TOKEN_CACHE_KEY === undefined) {
    res.redirect('login');
  } else {
      console.log('Logged in');
       aboutme(req,res);

  }
});
router.get('/aboutmail', function (req, res) {
  // check for token
  me(req,res);
});
router.get('/aboutme', function (req, res) {
  // check for token
  aboutme(req,res);
});


router.get('/disconnect', function (req, res) {
  // check for token
  req.session.destroy();
  res.clearCookie('nodecookie');
  clearCookies(res);
  res.status(200);
  res.redirect('http://localhost:3000');
});

/* GET home page. */
router.get('/login', function (req, res) {
  if (req.query.code !== undefined) {
    authHelper.getTokenFromCode(req.query.code, function (e, accessToken, refreshToken) {
      if (e === null) {
        // cache the refresh token in a cookie and go back to index
        res.cookie(authHelper.ACCESS_TOKEN_CACHE_KEY, accessToken);
        res.cookie(authHelper.REFRESH_TOKEN_CACHE_KEY, refreshToken);
        res.redirect('/');
      } else {
        console.log(JSON.parse(e.data).error_description);
        res.status(500);
        res.send();
      }
    });
  } else {
      console.log(authHelper.getAuthUrl());
      res.redirect(authHelper.getAuthUrl());
  //  res.render('login', { auth_url: authHelper.getAuthUrl() });
  }
});


function aboutme(req,res)
{
    var options = {
    host: 'graph.microsoft.com',
    path: '/v1.0/me',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + req.cookies.ACCESS_TOKEN_CACHE_KEY
    }
  };

  https.get(options, function (response) {
    var body = '';
    response.on('data', function (d) {
      body += d;
    });
    response.on('end', function () {
      var error;
      if (response.statusCode === 200) {
                console.log(body);
                console.log(JSON.parse(body).displayName);
                res.send('Welcome ' + JSON.parse(body).displayName);
        //callback(null, JSON.parse(body));

      } else {
        error = new Error();
        error.code = response.statusCode;
        error.message = response.statusMessage;
        // The error body sometimes includes an empty space
        // before the first character, remove it or it causes an error.
        body = body.trim();
        error.innerError = JSON.parse(body).error;
        console.log(error, null);
      }
    });
  }).on('error', function (e) {
    console.log((e, null));
  });

}
function me(req,res)
{
    var options = {
    host: 'graph.microsoft.com',
    path: 'v1.0/me/notes/',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + req.cookies.ACCESS_TOKEN_CACHE_KEY
    }
  };

  https.get(options, function (response) {
    var body = '';
    response.on('data', function (d) {
      body += d;
    });
    response.on('end', function () {
      var error;
      if (response.statusCode === 200) {
                res.send(body);
        //callback(null, JSON.parse(body));

      } else {
        error = new Error();
        error.code = response.statusCode;
        error.message = response.statusMessage;
        // The error body sometimes includes an empty space
        // before the first character, remove it or it causes an error.
        body = body.trim();
        error.innerError = JSON.parse(body).error;
        console.log(error, null);
      }
    });
  }).on('error', function (e) {
    console.log((e, null));
  });

}
function aboutmail(req,res)
{
    var options = {
    host: 'graph.microsoft.com',
    path: '/v1.0/me/messages',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + req.cookies.ACCESS_TOKEN_CACHE_KEY
    }
  };

  https.get(options, function (response) {
    var body = '';
    response.on('data', function (d) {
      body += d;
    });
    response.on('end', function () {
      var error;
      if (response.statusCode === 200) {
                console.log(JSON.parse(body));
                res.send(JSON.parse(body));
        //callback(null, JSON.parse(body));

      } else {
        error = new Error();
        error.code = response.statusCode;
        error.message = response.statusMessage;
        // The error body sometimes includes an empty space
        // before the first character, remove it or it causes an error.
        body = body.trim();
        error.innerError = JSON.parse(body).error;
        console.log(callback(error, null));
      }
    });
  }).on('error', function (e) {
    console.log((e, null));
  });

}

function renderSendMail(req, res) {
  requestUtil.getUserData(
    req.cookies.ACCESS_TOKEN_CACHE_KEY,
    function (firstRequestError, firstTryUser) {
      if (firstTryUser !== null) {
        req.session.user = firstTryUser;
        res.render(
          'sendMail',
          {
            display_name: firstTryUser.displayName,
            user_principal_name: firstTryUser.userPrincipalName
          }
        );
      } else if (hasAccessTokenExpired(firstRequestError)) {
        // Handle the refresh flow
        authHelper.getTokenFromRefreshToken(
          req.cookies.REFRESH_TOKEN_CACHE_KEY,
          function (refreshError, accessToken) {
            res.cookie(authHelper.ACCESS_TOKEN_CACHE_KEY, accessToken);
            if (accessToken !== null) {
              requestUtil.getUserData(
                req.cookies.ACCESS_TOKEN_CACHE_KEY,
                function (secondRequestError, secondTryUser) {
                  if (secondTryUser !== null) {
                    req.session.user = secondTryUser;
                    res.render(
                      'sendMail',
                      {
                        display_name: secondTryUser.displayName,
                        user_principal_name: secondTryUser.userPrincipalName
                      }
                    );
                  } else {
                    clearCookies(res);
                    renderError(res, secondRequestError);
                  }
                }
              );
            } else {
              renderError(res, refreshError);
            }
          });
      } else {
        renderError(res, firstRequestError);
      }
    }
  );
}

router.post('/', function (req, res) {
  var destinationEmailAddress = req.body.default_email;
  var mailBody = emailer.generateMailBody(
    req.session.user.displayName,
    destinationEmailAddress
  );
  var templateData = {
    display_name: req.session.user.displayName,
    user_principal_name: req.session.user.userPrincipalName,
    actual_recipient: destinationEmailAddress
  };

  requestUtil.postSendMail(
    req.cookies.ACCESS_TOKEN_CACHE_KEY,
    JSON.stringify(mailBody),
    function (firstRequestError) {
      if (!firstRequestError) {
        res.render('sendMail', templateData);
      } else if (hasAccessTokenExpired(firstRequestError)) {
        // Handle the refresh flow
        authHelper.getTokenFromRefreshToken(
          req.cookies.REFRESH_TOKEN_CACHE_KEY,
          function (refreshError, accessToken) {
            res.cookie(authHelper.ACCESS_TOKEN_CACHE_KEY, accessToken);
            if (accessToken !== null) {
              requestUtil.postSendMail(
                req.cookies.ACCESS_TOKEN_CACHE_KEY,
                JSON.stringify(mailBody),
                function (secondRequestError) {
                  if (!secondRequestError) {
                    res.render('sendMail', templateData);
                  } else {
                    clearCookies(res);
                    renderError(res, secondRequestError);
                  }
                }
              );
            } else {
              renderError(res, refreshError);
            }
          });
      } else {
        renderError(res, firstRequestError);
      }
    }
  );
});

function hasAccessTokenExpired(e) {
  var expired;
  if (!e.innerError) {
    expired = false;
  } else {
    expired = e.code === 401 &&
      e.innerError.code === 'InvalidAuthenticationToken' &&
      e.innerError.message === 'Access token has expired.';
  }
  return expired;
}

function clearCookies(res) {
  res.clearCookie(authHelper.ACCESS_TOKEN_CACHE_KEY);
  res.clearCookie(authHelper.REFRESH_TOKEN_CACHE_KEY);
}

function renderError(res, e) {
  res.render('error', {
    message: e.message,
    error: e
  });
}

module.exports = router;
