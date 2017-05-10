/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */
// application dependencies
var express = require('express');
var session = require('express-session');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var http = require('http');

var app = express();

// view engine setup

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// session middleware configuration
// see https://github.com/expressjs/session
app.use(session({
  secret: '12345QWERTY-SECRET',
  name: 'nodecookie',
  resave: false,
  saveUninitialized: false
}));

app.use('/', routes);


const port = process.env.PORT || '3000';
app.set('port', port);
const server = http.createServer(app);

server.listen(port, () => console.log(`API running on localhost:${port}`));