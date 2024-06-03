var express = require('express');
const path = require('path');
const { send } = require('process');
var fs = require('fs');

var router = express.Router();

router.get('/image/:id', function(req, res, next){
  // Check id is valid

  // Check image exists
  let query = `SELECT CONCAT(BIN_TO_UUID(file_name_rand), file_name_orig) AS file_name, public, branch_id FROM images WHERE image_id=?;`;
  req.sqlHelper(query, [req.params.id], req).then(function(results){
    if(results.length === 0){
      // Image doesn't exists
      res.status(404).send("No image with that id found");
      return;
    }
    if(results[0].public == true){
      // It's public, so just send the image back
      res.sendFile(path.join(__dirname, '..', 'images', results[0].file_name));
      return;
    } else {
      // Do this
      /*
        Authenticate user
      */
      if(req.session.isLoggedIn == false){
        res.status(403).send("Log in to access");
      } else {
        // NEED TO ACTUALLY CHECK THEY BELONG TO THE CORRECT BRANCH
        res.sendFile(path.join(__dirname, '..', 'images', results[0].file_name));
        return;
      }
    }
  }).catch(function(err) {return sendError(res, err);});
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

function sendError(res, next, err){
  // Send
  if(err === undefined){
    res.sendStatus(500);
    return;
  }
  if(err.message !== undefined){
    res.status(500).send(err.message);
  } else {
    res.status(500).json(err);
  }
  return;
}

function updateSessionVariables(req, uname){
  return new Promise( (resolve, reject) => {
    // Correct username and password
    // log user in
    req.session.isLoggedIn = true;
    req.session.username = uname;
    // Get the users userID from the DB
    var query = "SELECT BIN_TO_UUID(user_id) as user_id FROM users WHERE username=?;";
    req.sqlHelper(query, [uname], req).then(function(results)
      {
        // user id succesfully got from database
        req.session.userID = results[0].user_id;

        // Should now get other information about the user from the databases
        // (can likely be done in parralel with an array of promises)

        // Will likely need to add:
        // an array of branches they are a member of
        // Branch they manage
        // are they a system admin?

        // Return
        return resolve();
      }).catch(function(err) {return reject(err);});
  });
}

router.post('/login', function (req, res, next) {
  // Need to check validity of inputs (NOT DONE YET)
  if (req.body.username === undefined || req.body.password === undefined) {
    res.status(400).send("Undefined username or password"); // bad request
    return;
  }
  var uname = req.body.username;
  var pwd = req.body.password;

  // Check for matching user in database
  var query = "SELECT COUNT(*) AS count FROM users WHERE username=? AND password_hash=?";
  var queryPromise = req.sqlHelper(query, [uname, pwd], req);

  // Wait for query to complete
  queryPromise.then(function(result)
    {
      // Query completed successfully
      if(result[0].count == 0){
        // Wrong username or password
        res.status(403).send("Wrong username or password");
        return;
      } else {
        // Log them in by updating the appropriate session variables.
        updateSessionVariables(req, uname).then(function()
          {
            // Session variables updated succesfully
            res.status(200).send("Log in succesful");
            return;
          }
        ).catch(function(err){ sendError(res, next, err);});
      }
    }
  ).catch( (err) => {sendError(res, next, err);});
});

router.get('/events/search', function (req, res, next) {
  // Get search
  let search_term = req.query.search;
  let from_date = req.query.from;
  let to_date = req.query.to;
  let max_num = req.query.n;
  let branches = req.query.branch;

  // Update to default if they weren't set (if there is a sensible default)
  if (from_date === undefined) {
    let today = new Date().toISOString().slice(0, 10);
    from_date = today;
  }
  if (max_num === undefined) {
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
  let query = "SELECT event_id AS id, event_name AS title, event_description AS description, DATE_FORMAT(start_date_time, '%D %M') AS date, DATE_FORMAT(start_date_time, '%l:%i %p') AS startTime, DATE_FORMAT(end_date_time, '%l:%i %p') AS endTime, DAYOFWEEK(start_date_time) AS dayOfWeek, event_location AS location, event_image AS image_url FROM events WHERE is_public=TRUE";

  // MODIFY QUERY BASED ON FILTERS
  let params = [];
  if (search_term !== undefined) {
    query += " AND (event_name LIKE ? OR event_description LIKE ?)";
    params.push('%' + search_term + '%', '%' + search_term + '%');
  }
  if (from_date !== undefined) {
    query += " AND start_date_time >= ?";
    params.push(from_date);
  }
  if (to_date !== undefined) {
    query += " AND start_date_time <= ?";
    params.push(to_date);
  }
  if (branches !== undefined && branches.length > 0) {
    if (Array.isArray(branches)) {
      query += " AND branch_id IN (" + branches.map(() => '?').join(',') + ")";
      params = params.concat(branches);
    } else {
      query += " AND branch_id = ?";
      params.push(branches);
    }
  }

  query += " ORDER BY start_date_time ASC LIMIT ?;";
  params.push(max_num);


  // Query the SQL database
  req.pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    connection.query(query, params, function (err, rows, fields) {
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

router.get('/events/get', function (req, res, next) {
  let from_date = new Date().toISOString().slice(0, 10);
  let branches = req.query.branch;
  // Construct the SQL query
  let query = `SELECT event_id AS id, event_name AS title, event_description AS description, DATE_FORMAT(start_date_time, '%D %M') AS date, DATE_FORMAT(start_date_time, '%l:%i %p') AS startTime, DATE_FORMAT(end_date_time, '%l:%i %p') AS endTime, DAYOFWEEK(start_date_time) AS dayOfWeek, event_location AS location, event_image AS image_url FROM events WHERE is_public=TRUE`;

  let params = [];
  if (from_date !== undefined) {
    query += " AND start_date_time >= ?";
    params.push(from_date);
  }
  if (branches !== undefined) {
    query += " AND branch_id = ?";
    params.push([branches]);
  }
  query += " ORDER BY start_date_time ASC LIMIT 10;";
  // Query the SQL database
  req.pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    connection.query(query, params, function (err, rows, fields) {
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


router.get('/events/id/:eventID/details.json', function (req, res, next) {
  // Check if the event exists



  // Check if the event is private, if so check user is logged in and a member of the appropriate branch

  let event_id = req.params.eventID;

  // Check if event exists
  req.pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    var query = "SELECT COUNT(*) AS count FROM events WHERE event_id=?";
    connection.query(query, [event_id], function (err, rows, fields) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      console.log(rows[0].count);
      if (rows[0].count == 0) {
        // Event doesn't exist
        res.sendStatus(404);
        return;
      } else {
        // Event exists
        var query = "SELECT event_id AS id, event_name AS title, event_description AS description, DATE(start_date_time) AS date, TIME(start_date_time) AS startTime, TIME(end_date_time) AS endTime, DAYOFWEEK(start_date_time) AS dayOfWeek, event_location AS location, event_image AS image_url FROM events WHERE event_id=?;";
        connection.query(query, [event_id], function (err, rows, fields) {
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


router.get('/events', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'events.html'));
});

router.get('/events/id/:eventId', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'event_details_example.html'));
});

router.get('/manage/events/create', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'create_event.html'));
});

router.get('/manage/events/edit/:eventId', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'edit_event.html'));
});

router.get('/manage/events/responses/:eventId', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'event_responses.html'));
});

router.get('/news', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'news.html'));
});

router.get('/news/id/:newsId', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'news_details_example.html'));
});

router.get('/manage/news/create', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'create_news.html'));
});

router.get('/branches', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'branches.html'));
});

router.get('/login', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

router.get('/register', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

router.get('/branches/id/:branchId', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'branch_details.html'));
});


router.get('/branches', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'branches.html'));
});

router.get('/private_policy', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'private_policy.html'));
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


module.exports = router;
