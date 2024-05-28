var express = require('express');
const path = require('path');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});


router.post('/login', function(req, res, next){
  // Need to check validity of inputs (NOT DONE YET)
  if(req.body.username === undefined || req.body.password === undefined){
    res.status(400); // bad request
    res.send();
  }
  var uname = req.body.username;
  var pwd = req.body.password;

  // Check for matching user in database
  req.pool.getConnection( function(err,connection) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    var query = "SELECT COUNT(*) AS count FROM users WHERE username=? AND password_hash=?";
    connection.query(query, [uname, pwd], function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      console.log(rows[0].count);
      if(rows[0].count == 0){
        // Wrong uname or pwd
        res.sendStatus(403);
        return;
      } else {
        // Correct username and password
        // log user in
        req.session.isLoggedIn = true;
        req.session.username = uname;
        // Get the users userID from the DB
        var query = "SELECT BIN_TO_UUID(user_id) as user_id FROM users WHERE username=?;";
        connection.query(query, [uname], function(err, rows, fields) {
          connection.release(); // release connection
          if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
          }
          console.log(rows);
          console.log(rows[0].user_id);
          req.session.userID = rows[0].user_id;
          console.log("Sesion: " + req.session.id + " uID: " + req.session.userID);
          return;
        });

        // Will likely need to add:
        // an array of branches they are a member of
        // an array of branches they manage???
        // are they a system admin?

        res.sendStatus(200);
      }

      return;
    });
  });
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

router.get('/news/id/:newsId', function(req, res, next){
  res.sendFile(path.join(__dirname, '..', 'public', 'news_details_example.html'));
});

router.get('/manage/news/create', function(req, res, next){
  res.sendFile(path.join(__dirname, '..', 'public', 'create_news.html'));
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
