var express = require('express');
var router = express.Router();

router.post('/events/rsvp', function (req, res, next) {
  // Get the JSON object from the response
  if (req.body.eventID === undefined || typeof (req.body.eventID) !== "string") {
    // Invalid argument event id
    res.status(400).send("Invalid eventID (or none specified)");
    return;
  }

  if (req.body.RSVP === undefined || typeof (req.body.RSVP) !== "string" || (req.body.RSVP.toLowerCase() != 'yes' && req.body.RSVP.toLowerCase() != 'no')) {
    res.status(400).send('Invalid RSVP field. Should be "yes" or "no"');
    return;
  }

  if(!req.session.isLoggedIn){
    res.status(403).send('Must be logged in to RSVP for events');
    return;
  }

  if (!req.session.userID) {
    res.status(200).send('User ID is undefined');
    return;
  }

  // Check the event exists
  let db_error = false;
  let db_error_text = "";
  let event_exists = true;
  let query1_done = false;
  let query = `SELECT EXISTS(SELECT * FROM events WHERE event_id = ?);`;
  req.pool.getConnection( function(err,connection) {
    if (err) {
      db_error = true;
      console.log("error");
      db_error_text = "Couldn't get Connection to Database";
      return;
    }
    console.log("making query");
    connection.query(query, [req.body.eventID], function(err, rows, fields) {
      connection.release(); // release connection
      if (err) {
        db_error = true;
        console.log("error");
        db_error_text = "Error with database query";
        return;
      }
      if(rows[0].member_of_branch == 0){
        // Event doesn't exist
        event_exists = false;
      }
      console.log("query 1 done");
      query1_done = true;
      return;
    });
  });



  // Check user belongs to the correct branch
  let correct_branch_member = true;
  let query2_done = false;
  query = `SELECT EXISTS(
                  SELECT * FROM user_branch_affiliation
                  WHERE user_id=UUID_TO_BIN(?) AND branch_id=(
                        SELECT branch_id FROM events WHERE event_id = ?
                      )
                  ) AS member_of_branch;`;
  console.log("getting connection");
  req.pool.getConnection( function(err,connection) {
    if (err) {
      db_error = true;
      db_error_text = "Couldn't get Connection to Database";
      return;
    }
    connection.query(query, [req.session.userID, req.body.eventID], function(err, rows, fields) {
      if (err) {
        db_error = true;
        db_error_text = "Error with database query";
      }
      if(rows[0].member_of_branch == 0){
        // They are not a member of the correct branch
        correct_branch_member = false;
        connection.release(); // release connection
      }
      console.log("query 2 done");
      query2_done = true;
      return;
    });
  });

  while(!db_error && (!query1_done && !query2_done)){
    //console.log("Db error: " + db_error + " query1 done: " + query1_done + " query2_done: " + query2_done);
    // Wait for queries to finish (or an error to occur)
  }
  if(db_error){
    // Error in database
    res.status(500).send(db_error_text);
    return;
  }
  if(!correct_branch_member){
    res.status(403).send("Not a member of the appropriate branch to RSVP for this event");
    return;
  }
  if(!event_exists){
    res.status(404).send("Event not found");
    return;
  }

  // Update the database
  let event_id = req.body.eventID;      // Event ID of the event theyre RSVPing to
  let response = false;                 // Their response to the event
  if (req.body.RSVP.toLowerCase() == 'yes') {
    response = true;
  }

  let query3_done = false;
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      db_error = true;
      db_error_text = "Couldn't get Connection to Database";
      return;
    }
    var query = "INSERT INTO user_event_attendance (event_id, user_id, rsvp) VALUES (?,UUID_TO_BIN(?),?) ON DUPLICATE KEY UPDATE rsvp=?;";
    connection.query(query, [event_id, req.session.userID, response, response], function (err, rows, fields) {
      connection.release(); // release connection
      if (err) {
        db_error = true;
        db_error_text = "Error with Database Query";
        return;
      }
      // Has been inserted successfully
      query3_done = true;
      return;
    });
  });

  // Wait for query to finish
  while(!db_error && !query3_done){
    // Wait
  }

  if(db_error){
    // Error in database
    res.status(500).send(db_error_text);
    return;
  } else {
    res.status(200).send("RSVP succesful");
    return;
  }
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
  let query = "SELECT event_id AS id, event_name AS title, event_description AS description, DATE_FORMAT(start_date_time, '%D %M') AS date, DATE_FORMAT(start_date_time, '%l:%i %p') AS startTime, DATE_FORMAT(end_date_time, '%l:%i %p') AS endTime, DAYOFWEEK(start_date_time) AS dayOfWeek, event_location AS location, event_image AS image_url FROM events";

  // check if where has been added to query
  let hasWhere = false;

  // MODIFY QUERY BASED ON FILTERS
  let params = [];
  if (search_term !== undefined) {
    query += hasWhere ? " AND (event_name LIKE ? OR event_description LIKE ?)" : " WHERE (event_name LIKE ? OR event_description LIKE ?)";
    hasWhere = true;
    params.push('%' + search_term + '%', '%' + search_term + '%');
  }
  if (from_date !== undefined) {
    query += hasWhere ? " AND start_date_time >= ?" : " WHERE start_date_time >= ?";
    hasWhere = true;
    params.push(from_date);
  }
  if (to_date !== undefined) {
    query += hasWhere ? " AND start_date_time <= ?" : " WHERE start_date_time <= ?";
    hasWhere = true;
    params.push(to_date);
  }
  if (branches !== undefined && branches.length > 0) {
    if (Array.isArray(branches)) {
      query += hasWhere ? " AND branch_id IN (" + branches.map(() => '?').join(',') + ")" : " WHERE branch_id IN (" + branches.map(() => '?').join(',') + ")";
      hasWhere = true;
      params = params.concat(branches);
    } else {
      query += hasWhere ? " AND branch_id = ?" : " WHERE branch_id = ?";
      hasWhere = true;
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
  let query = `SELECT event_id AS id, event_name AS title, event_description AS description, DATE_FORMAT(start_date_time, '%D %M') AS date, DATE_FORMAT(start_date_time, '%l:%i %p') AS startTime, DATE_FORMAT(end_date_time, '%l:%i %p') AS endTime, DAYOFWEEK(start_date_time) AS dayOfWeek, event_location AS location, event_image AS image_url FROM events`;

  // check if where has been added to query
  let hasWhere = false;

  let params = [];
  if (from_date !== undefined) {
    query += hasWhere ? " AND start_date_time >= ?" : " WHERE start_date_time >= ?";
    hasWhere = true;
    params.push(from_date);
  }
  if (branches !== undefined) {
    query += hasWhere ? " AND branch_id = ?" : " WHERE branch_id = ?";
    hasWhere = true;
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

// get user info for access level
router.get('/info', function (req, res, next) {
  if (req.session.isLoggedIn) {
    res.json({
      userID: req.session.userID,
      username: req.session.username,
      access_level: req.session.access_level
    });
  } else {
    res.status(401).send('Not authenticated');
  }
});

module.exports = router;
