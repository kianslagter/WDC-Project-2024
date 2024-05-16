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

router.get('/events/id/:eventId', function(req, res, next){
  res.sendFile(path.join(__dirname, '..', 'public', 'event_details_example.html'));
});

router.get('/manage/events/create', function(req, res, next){
  res.sendFile(path.join(__dirname, '..', 'public', 'create_event.html'));
});

router.get('/news', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'news.html'));
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

router.get('/branches/id/:branchId', function(req, res, next){
  res.sendFile(path.join(__dirname, '..', 'public', 'branch_details.html'));
});


router.get('/branches', function(req, res, next){
  res.sendFile(path.join(__dirname, '..', 'public', 'branches.html'));
});

module.exports = router;
