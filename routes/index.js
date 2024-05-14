var express = require('express');
const path = require('path');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

/* Temporary page for front end testing to change view from visitor/user/manager/admin */
router.get('/accesslevel', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'accesslevel.html'));
});

router.get('/events', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'events.html'));
});

router.get('/events/id/:eventId', function(req, res, next){
  res.sendFile(path.join(__dirname, '..', 'public', 'event_details_example.html'));
});

router.get('/about', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'about.html'));
});

router.get('/branches', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'branches.html'));
});

router.get('/login', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

router.get('/register', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

module.exports = router;
