var express = require('express');
const path = require('path');
const { send } = require('process');
var fs = require('fs');
var tools = require('./helpers')

var router = express.Router();

router.get('/image/:id', function(req, res, next){
  // Check image exists
  let query = `SELECT CONCAT(BIN_TO_UUID(file_name_rand), file_name_orig) AS file_name, public, branch_id FROM images WHERE image_id=?;`;
  tools.sqlHelper(query, [req.params.id], req).then(function(results){
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
      if(!req.session.isLoggedIn || !req.session.branches.contains(results[0].branch)){
        res.status(403).send("Not member of correct branch log in to access");
        return;
      } else {
        res.sendFile(path.join(__dirname, '..', 'images', results[0].file_name));
        return;
      }
    }
  }).catch(function(err) {return tools.sendError(res, err);});
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});


function updateSessionVariables(req, res, uname){
  return new Promise( (resolve, reject) => {
    // Correct username and password
    // log user in
    req.session.isLoggedIn = true;
    req.session.username = uname;
    // Get the users userID from the DB
    var query = "SELECT BIN_TO_UUID(user_id) as user_id FROM users WHERE username=?;";
    tools.sqlHelper(query, [uname], req).then(function(results)
      {
        // user id succesfully got from database
        req.session.userID = results[0].user_id;

        // Should now get other information about the user from the databases
        // (can likely be done in parralel with an array of promises)

        // Make some SQL queries to check:
        // branches they are a member of
        query = "SELECT branch_id FROM user_branch_affiliation WHERE user_id = UUID_TO_BIN(?);";
        var branches_member = tools.sqlHelper(query, [req.session.userID], req);
        // Branch they manage
        query = "SELECT branch_managed FROM users WHERE user_id = UUID_TO_BIN(?);";
        var branch_managed = tools.sqlHelper(query, [req.session.userID], req);
        // are they a system admin?
        query = "SELECT system_admin FROM users WHERE user_id = UUID_TO_BIN(?);";
        var system_admin = tools.sqlHelper(query, [req.session.userID], req);

        // Wait for the queries to finish
        Promise.all([branches_member, branch_managed, system_admin]).then(function (values) {
          // Check branches they are member of
          let members_results = values[0];
          req.session.branches = [];
          for(let i = 0; i < members_results.length; i++){
            // Add each branch to the session variable branches
            req.session.branches.push(members_results[i].branch_id);
          }

          // Check branch they manage (if any)
          let manage_results = values[1];
          if(manage_results[0].branch_managed === null){
            req.session.branch_managed = null;
          } else {
            req.session.branch_managed = manage_results[0].branch_managed;
          }

          // Check if they are a system admin
          let admin_results = values[2];
          if(admin_results[0].system_admin == true){
            req.session.admin = true;
          } else {
            req.session.admin = false;
          }
          return resolve();
        }).catch((err)=> {return reject(err);});
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
  var queryPromise = tools.sqlHelper(query, [uname, pwd], req);

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
        updateSessionVariables(req, res, uname).then(function()
          {
            // Session variables updated succesfully
            res.status(200).send("Log in succesful");
            return;
          }
        ).catch(function(err){ tools.sendError(res, err);});
      }
    }
  ).catch( (err) => {tools.sendError(res, err);});
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
  let event_id = req.params.eventID;
  // Check if the event exists
  let query = "SELECT EXISTS(SELECT * FROM events WHERE event_id = ?) AS event_exists;";
  tools.sqlHelper(query, [event_id], req).then(function(results){
    if(results[0].event_exists == 0){
      // Event does not exist
      res.status(404).send("Event not found");
      return;
    }
    // Get the event details
    query = `SELECT event_name AS title, event_description AS description, DATE(start_date_time) AS date, TIME(start_date_time) AS startTime, TIME(end_date_time) AS endTime, DAYOFWEEK(start_date_time) AS dayOfWeek, event_location AS location, event_image AS image_url, is_public AS public, branch_id AS branch
            FROM events
            WHERE event_id=?;`;
    tools.sqlHelper(query, [event_id], req).then(function(results){
      if(!results[0].public){
        // Authenticate user
        console.log(req.session);
        if(!req.session.isLoggedIn || !req.session.branches.contains(results[0].branch)){
          // Not logged in or not correct branch
          res.status(403).send("Not a member of correct branch (or not logged in)");
          return;
        }
      }
      // Send the details
      res.json(results[0]);
      return;
    }).catch(function (err) {tools.sendError(res, err);});
  }).catch(function (err) {tools.sendError(res,err);});
});


router.get('/events', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'events.html'));
});

router.get('/events/id/:eventId', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'event_details_example.html'));
});

router.get('/news', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'news.html'));
});

router.get('/news/id/:newsId', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'news_details_example.html'));
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

module.exports = router;
