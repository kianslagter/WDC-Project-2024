var express = require('express');
var router = express.Router();

router.post('/events/rsvp', function (req, res, next) {
  console.log("RSVP from " + req.session.userID);
  // Get the JSON object from the response
  if (req.body.eventID === undefined || typeof (req.body.eventID) !== "string") {
    console.log("sending 400");
    // Invalid argument event id
    res.status(400);  // bad request
    res.send();
    return;
  }
  if (req.body.RSVP === undefined || typeof (req.body.RSVP) !== "string" || (req.body.RSVP != 'yes' && req.body.RSVP != 'no')) {
    res.status(400);  // bad request
    res.send();
    return;
  }
  if (!req.session.userID) {
    res.status(400).send('User ID is undefined');
    return;
  }


  // Check user belongs to the correct branch???

  // Update the database
  let username = req.session.username;  // Username of user
  let event_id = req.body.eventID;      // Event ID of the event theyre RSVPing to
  let response = false;                 // Their response to the event
  if (req.body.RSVP == 'Yes') {
    response = true;
  }

  req.pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      connection.release();
      return;
    }
    var query = "INSERT INTO user_event_attendance (event_id, user_id, rsvp) VALUES (?,UUID_TO_BIN(?),?) ON DUPLICATE KEY UPDATE rsvp=?;";
    connection.query(query, [event_id, req.session.userID, response, response], function (err, rows, fields) {
      connection.release(); // release connection
      if (err) {
        console.log(err);
        res.sendStatus(500);
        connection.release();
        return;
      }
      res.sendStatus(200);
      return;
    });
  });
});

router.get('/events/search', function (req, res, next) {
  // Get search
  let search_term = req.query.search;
  let from_date = req.query.from;
  let to_date = req.query.from;
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

  // MODIFY QUERY BASED ON FILTERS
  if (search_term !== undefined) {
    query += " AND (event_name LIKE ? OR event_description LIKE ?)";
  }

  query += " ORDER BY start_date_time ASC LIMIT ?;";

  // Query the SQL database
  req.pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    let params = [];
    if (search_term !== undefined) {
      params.push('%' + search_term + '%');
      params.push('%' + search_term + '%');
    }
    params.push(max_num);
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


module.exports = router;
