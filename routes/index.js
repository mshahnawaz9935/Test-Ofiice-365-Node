
var express = require('express');
var router = express.Router();
var authHelper = require('../authHelper.js');
 var https = require ('https');
 var request = require('request');
 var t=2; var sec=2;

var notebookid;  
var sectionid;
/* GET home page. */
router.get('/', function (req, res) {
  // check for token
  if (req.cookies.REFRESH_TOKEN_CACHE_KEY === undefined) {
    res.redirect('login');
  } else {
      console.log('Logged in' );
       aboutme(req,res);

  }
});
router.get('/aboutmail', function (req, res) {

  aboutmail(req,res);
});
router.get('/aboutme', function (req, res) {
  
  aboutme(req,res);
});

router.get('/createnotebook', function (req, res) {


  // aboutmail(req.cookies.ACCESS_TOKEN_CACHE_KEY ,
  // function(data){
  //   res.json(data);
  // }
  // );
  var notebookid = '';


  checknote(req.cookies.ACCESS_TOKEN_CACHE_KEY , function(t)
  {
    if(t==1)
    res.json('Notebook exists');
    else {
      createnotebook(req.cookies.ACCESS_TOKEN_CACHE_KEY ,
  function(data){
    res.json('Notebook created and id is' + data);
  }
  );
  }



  });






});

router.get('/checknote', function (req, res) {
  // check for token
   checknote(req.cookies.ACCESS_TOKEN_CACHE_KEY);
  setTimeout(function()
  {
    console.log('t is', t);
    if(t == 1)
    {
      checksection(req.cookies.ACCESS_TOKEN_CACHE_KEY);
       setTimeout(function()
       {
          console.log( 'sec is ', sec);
      if(sec==1)
      {
        console.log('Both exists');
       writespecific(req.cookies.ACCESS_TOKEN_CACHE_KEY, 'lava', 'Volcanoes');

      }
      else
      {
        console.log('Notebook exists and section created');
        createsection(req.cookies.ACCESS_TOKEN_CACHE_KEY , notebookid);
          setTimeout(function()
          {
              writespecific(req.cookies.ACCESS_TOKEN_CACHE_KEY, 'lava', 'Volcanoes');
          },4700);
      }
       },1200);

    }
     else 
     {
       console.log('Notebook and section created');
      // res.json('Notebook created');
      createnotebook(req.cookies.ACCESS_TOKEN_CACHE_KEY);
      setTimeout(function()
          {
              writespecific(req.cookies.ACCESS_TOKEN_CACHE_KEY, 'lava', 'Volcanoes');
          },6000);
    }
  },1200);
        res.json('Notebooks created or updated and data saved to Note');
     
});

router.get('/writenote', function (req, res) {
  // check for token
  writetonote(req.cookies.ACCESS_TOKEN_CACHE_KEY, 'lava', 'Volcanoes');
});
router.get('/write2', function (req, res) {
  // check for token
  writespecific(req.cookies.ACCESS_TOKEN_CACHE_KEY, 'lava', 'Volcanoes');
  res.json('Written to note');
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
           if(error.code === 401 &&
      error.innerError.code === 'InvalidAuthenticationToken' ||
      error.innerError.message === 'Access token has expired.')
      {     console.log('Disconnect');
           res.redirect('/disconnect'); }
      }
    });
  }).on('error', function (e) {
    console.log((e, null));
  });

}
function checksection(token)
{   sec=0;
    var options = {
    host: 'graph.microsoft.com',
    path: '/beta/me/onenote/notebooks/'+ notebookid+ '/sections/?$select=displayName,id',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + token
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
            console.log(JSON.parse(body).value.length);
            var data = JSON.parse(body);
            for(var i=0; i< data.value.length; i++)
            {
                console.log(data.value[i].displayName);
                if(data.value[i].displayName == 'Almanac')
                {
                 sec=1;
                 sectionid = data.value[i].id;
                }
            }
            if(sec==1)
            {
            console.log('section exists and id is',sectionid ,'and sec is ' , sec );
            sec=1;
            }
            else
            { console.log('section doesnt exists and sec is ', sec);
              sec=0;
            }
             //  res.json('Creating and Updating notebooks');
        //callback(null, JSON.parse(body));

      } else {
        error = new Error();
        error.code = response.statusCode;
        error.message = response.statusMessage;
        // The error body sometimes includes an empty space
        // before the first character, remove it or it causes an error.
        body = body.trim();
     //   error.innerError = JSON.parse(body).error;
        console.log(body, null);
      }
    });
  }).on('error', function (e) {
    console.log((e, null));
  });

}
function checknote(token , callback)
{   t=0;
    var options = {
    host: 'graph.microsoft.com',
    path: '/beta/me/onenote/notebooks?$select=displayName,id',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + token
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
            console.log(JSON.parse(body).value.length);
            var data = JSON.parse(body);
            for(var i=0; i< data.value.length; i++)
            {
                console.log(data.value[i].displayName);
                if(data.value[i].displayName == 'TCD Almanac')
                {
                 t=1;
                 notebookid = data.value[i].id;
                }
            }
            if(t==1)
            {
            console.log('notebook exists and t is', t);
            t=1;
            }
            else
            { console.log('notebook doesnt exists and t is', t);
              t=0;
            }
             //  res.json('Creating and Updating notebooks');
        callback(t);

      } else {
        error = new Error();
        error.code = response.statusCode;
        error.message = response.statusMessage;
        // The error body sometimes includes an empty space
        // before the first character, remove it or it causes an error.
        body = body.trim();
     //   error.innerError = JSON.parse(body).error;
        console.log(body, null);
      }
    });
  }).on('error', function (e) {
    console.log((e, null));
  });

}
function createnotebook(token , callback)
{
     var options = {
    url: 'https://graph.microsoft.com/beta/me/onenote/notebooks',
    method: 'POST',
    body : JSON.stringify({ "displayName" : "TCD Almanac" }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + token
    }
  };

  request(options, function (err, res, body) {
  if (err) {
    console.log('Post Error :', err)
    return
  }
  console.log('Succesfully Created notebook :', JSON.parse(body).id);
  notebookid =  JSON.parse(body).id;
  callback(notebookid);
});
  // setTimeout(function()
  //       {   createsection(token , notebookid);
  //       },1800);
 


}
function createsection(token, notebookid)
{

     var url = 'https://graph.microsoft.com/beta/me/onenote/notebooks/' + notebookid + '/sections';
     console.log('url is ' + url);
            console.log('notebook id' , notebookid);
        var options = {
        url: 'https://graph.microsoft.com/beta/me/onenote/notebooks/' + notebookid + '/sections',
        method: 'POST',
        body : JSON.stringify({ "displayName" : "Almanac" }),
        headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + token
        }
    };

    request(options, function (err, res, body) {
    if (err) {
        console.log('Post section Error :', err)
        return
    }
    console.log('Post section Body :', body, JSON.parse(body).id)
    sectionid = JSON.parse(body).id;
    });
}


function writespecific(token,topic,chapter)
{
   
    console.log('inside token' , topic,chapter);
    var url = '';
    var queryObject =  {
    "userID":"IOK_Postman_Testing",
    "parameters":{
            "parameterInstance":[
                {"name":"complexity","value":5},
                {"name":"duration","value":4}, 
                {"name":"topic","value":topic},
                {"name":"chapter","value":chapter}
            ]
        }
    } ;
    var favourites = {};
    request({
        url: "http://kdeg-vm-43.scss.tcd.ie/ALMANAC_Personalised_Composition_Service/composer/atomiccompose",
        method: "POST",
        json: true,   // <--Very important!!!
        body: queryObject,
        headers: {
            "content-type": "application/json",  // <--Very important!!!
        },
        }, function (error, response, body){
            favourites = response.body;
            console.log(favourites.sections.section.length);
            for(var i=0; i< favourites.sections.section.length; i++) 
            {  
                    url = url + " <h3>Images from section "+ (i+1) + " are as under</h3>";
                    url = url + "<h4>" +  favourites.sections.section[i].text.text + "</h4>";
                    try{
                        var image_len = favourites.sections.section[i].images.image.length;
                    }
                    catch(err)
                    {    continue;  }
                    finally { }
                    for(var j=0; j< image_len;j++)
                    {
                    url = url+ "<p><img src=" + "\"" + favourites.sections.section[i].images.image[j].url + "\"" + "/></p>";
                    }
                }
            
        });
        
       
       //  console.log(htmlPayload); 
        setTimeout(function()
        {   
                var htmlPayload =
        "<!DOCTYPE html>" +
        "<html>" +
        "<head>" +
        "    <title>"+ favourites.title +"</title>" +
        "    <meta name=\"created\" content=\"" + dateTimeNowISO() + "\">" +
        "</head>" +
        "<body>" +
        "    <p> View Your Page <i>formatted</i></p>" +
         url +
        "</body>" +
        "</html>";   
            
            createNewPage(token, htmlPayload, false); 
        }, 1500);
     
    }


    function createNewPage(accessToken, payload, multipart) {
            var options = {
                url: 'https://graph.microsoft.com/beta/me/onenote/sections/'+ sectionid  +'/pages',
                headers: {
                'Authorization': 'Bearer ' + accessToken
                }
            };
            // Build simple request
            if (!multipart) {
                options.headers['Content-Type'] = 'text/html';
                options.body = payload;
            }
            var r = request.post(options);
            // Build multi-part request
            if (multipart) {
                var CRLF = '\r\n';
                var form = r.form(); // FormData instance
                _.each(payload, function(partData, partId) {
                form.append(partId, partData.body, {
                    // Use custom multi-part header
                    header: CRLF +
                    '--' + form.getBoundary() + CRLF +
                    'Content-Disposition: form-data; name=\"' + partId + '\"' + CRLF +
                    'Content-Type: ' + partData.contentType + CRLF + CRLF
                });
                });
            }
}


function writetonote(token,topic,chapter)
{
   
    console.log('inside token' , topic,chapter);
    var url = '';
    var queryObject =  {
    "userID":"IOK_Postman_Testing",
    "parameters":{
            "parameterInstance":[
                {"name":"complexity","value":5},
                {"name":"duration","value":4}, 
                {"name":"topic","value":topic},
                {"name":"chapter","value":chapter}
            ]
        }
    } ;
    var favourites = {};
    request({
        url: "http://kdeg-vm-43.scss.tcd.ie/ALMANAC_Personalised_Composition_Service/composer/atomiccompose",
        method: "POST",
        json: true,   // <--Very important!!!
        body: queryObject,
        headers: {
            "content-type": "application/json",  // <--Very important!!!
        },
        }, function (error, response, body){

            console.log("post query" + response.body);
            favourites = response.body;
            console.log(favourites.sections.section.length);
            for(var i=0; i< favourites.sections.section.length; i++) 
            {  
                    url = url + " <h3>Images from section "+ (i+1) + " are as under</h3>";
                    url = url + "<h4>" +  favourites.sections.section[i].text.text + "</h4>";
                    try{
                        var image_len = favourites.sections.section[i].images.image.length;
                    }
                    catch(err)
                    {    continue;  }
                    finally { }
                    for(var j=0; j< image_len;j++)
                    {
                    url = url+ "<p><img src=" + "\"" + favourites.sections.section[i].images.image[j].url + "\"" + "/></p>";
                    }
                }
            
        });
        
       
       //  console.log(htmlPayload); 
        setTimeout(function()
        {   
                var htmlPayload =
        "<!DOCTYPE html>" +
        "<html>" +
        "<head>" +
        "    <title>"+ favourites.title +"</title>" +
        "    <meta name=\"created\" content=\"" + dateTimeNowISO() + "\">" +
        "</head>" +
        "<body>" +
        "    <p> View Your Page <i>formatted</i></p>" +
         url +
        "</body>" +
        "</html>";   
            
            createPage(token, htmlPayload, false); 
        }, 1500);
     
    }


        function dateTimeNowISO() {
            return new Date().toISOString();
            }

    function createPage(accessToken, payload, multipart) {
         createnotebook(req,res);
            var options = {
                url: 'https://graph.microsoft.com/beta/me/onenote/'+ req.session.id  +'pages',
                headers: {
                'Authorization': 'Bearer ' + accessToken
                }
            };
            console.log('ACCESS TOKEN IS' + accessToken ,' Payload is', payload);
            // Build simple request
            if (!multipart) {
                options.headers['Content-Type'] = 'text/html';
                options.body = payload;
            }
            var r = request.post(options);
            // Build multi-part request
            if (multipart) {
                var CRLF = '\r\n';
                var form = r.form(); // FormData instance
                _.each(payload, function(partData, partId) {
                form.append(partId, partData.body, {
                    // Use custom multi-part header
                    header: CRLF +
                    '--' + form.getBoundary() + CRLF +
                    'Content-Disposition: form-data; name=\"' + partId + '\"' + CRLF +
                    'Content-Type: ' + partData.contentType + CRLF + CRLF
                });
                });
            }
            }




function aboutmail(token, callback)
{
    var options = {
    host: 'graph.microsoft.com',
    path: '/v1.0/me/messages',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + token
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
          //      res.send(JSON.parse(body));
        callback( JSON.parse(body));

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
