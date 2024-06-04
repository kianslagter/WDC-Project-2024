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
          req.session.userID = rows[0].user_id;
          res.sendStatus(200);
          return;
        });

        // Will likely need to add:
        // an array of branches they are a member of
        // an array of branches they manage???
        // are they a system admin?
      }
      return;
    });
  });
});

router.get('/events/search', function(req, res, next){
  // Get search
  let search_term = req.query.search;
  let from_date = req.query.from;
  let to_date = req.query.from;
  let max_num = req.query.n;
  let branches = req.query.branch;

  // Update to default if they weren't set (if there is a sensible default)
  if(from_date === undefined){
    let today = new Date().toISOString().slice(0, 10);
    from_date = today;
  }
  if(max_num === undefined){
    max_num = 20;
  } else {
    max_num = parseInt(max_num);
  }

  // Print the values
  /*
  console.log("Search term: " + search_term);
  console.log("from date: " + from_date);
  console.log("To date: " + to_date);
  console.log("Max num: " + max_num);
  console.log("Branches: " + branches);
  */

  // Construct the SQL query
  let query = "SELECT event_id AS id, event_name AS title, event_description AS description, DATE(start_date_time) AS date, TIME(start_date_time) AS startTime, TIME(end_date_time) AS endTime, DAYOFWEEK(start_date_time) AS dayOfWeek, event_location AS location, event_image AS image_url FROM events WHERE is_public=TRUE ORDER BY start_date_time ASC LIMIT ?;"

  // MODIFY QUERY BASED ON FILTERS
  // need to do still

  // Query the SQL database
  req.pool.getConnection( function(err,connection) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    connection.query(query, [max_num], function(err, rows, fields) {
      connection.release(); // release connection
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.type('json');
      res.send(JSON.stringify(rows));
      return;
    });
  });
});

router.get('/events/id/:eventID/details.json', function(req, res, next){
    // WILL NEED TO CAREFULLY AUTHENTICATE USER HERE, if event not public

    let event_id = req.params.eventID;

    // Check if event exists
    req.pool.getConnection( function(err,connection) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      var query = "SELECT COUNT(*) AS count FROM events WHERE event_id=?";
      connection.query(query, [event_id], function(err, rows, fields) {
        if (err) {
          console.log(err);
          res.sendStatus(500);
          return;
        }
        console.log(rows[0].count);
        if(rows[0].count == 0){
          // Event doesn't exist
          res.sendStatus(404);
          return;
        } else {
          // Event exists
          var query = "SELECT event_id AS id, event_name AS title, event_description AS description, DATE(start_date_time) AS date, TIME(start_date_time) AS startTime, TIME(end_date_time) AS endTime, DAYOFWEEK(start_date_time) AS dayOfWeek, event_location AS location, event_image AS image_url FROM events WHERE event_id=?;";
          connection.query(query, [event_id], function(err, rows, fields) {
            connection.release(); // release connection
            if (err) {
              console.log(err);
              res.sendStatus(500);
              return;
            }
            res.type('json');
            res.send(JSON.stringify(rows[0]));
            return;
          });
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

router.get('/admin/branches/create', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'create_branch.html'));
});

router.get('/manage/view_members', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'view_members.html'));
});

router.get('/event/id/:branchId/view_rsvp', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'view_rsvp.html'));
});

router.get('/manage', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'manager_dashboard.html'));
});

router.get('/admin', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin_dashboard.html'));
});


router.get('/private_policy', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'private_policy.html'));
});

module.exports = router;
