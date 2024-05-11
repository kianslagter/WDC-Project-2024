var express = require('express');
const path = require('path');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

router.get('/events', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'events.html'));
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

module.exports = router;
