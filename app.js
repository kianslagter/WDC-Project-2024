var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
var mysql = require('mysql');
var fs = require('fs');

var dbConnectionPool = mysql.createPool({
  connectionLimit : 100,
  host: 'localhost',
  database: 'volunteer_management_system'
});

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const manageRouter = require('./routes/manage');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(function(req, res, next) {
  req.pool = dbConnectionPool;
  next();
});

app.use(logger('dev'));
app.use(express.json({ limit: '1000kb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret: 'a very secret string',
  resave: false,
  saveUninitialized: true,
  coookie: { secure: false }
}));

// Check if they are logged in
app.use(function (req, res, next){
  if(req.session.isLoggedIn === undefined){
    // First time, intialise isLoggedIn to false
    req.session.isLoggedIn = false;
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// Authentication step (need to be logged in for further routes goes here I think)

app.use('/users', usersRouter);

// Authentication (branch managers only)

app.use('/manage', manageRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err});
});

module.exports = app;
