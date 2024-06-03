var express = require('express');
var router = express.Router();

router.post('/event/responses/:eventID', function (req, res, next) {
  // Should check manager is manager of the branch the event is owned by

  // Get the yeses
  var yes_responses;
  req.pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    const yesQuery = `
    SELECT CONCAT(users.first_name, ' ', users.last_name) AS name, BIN_TO_UUID(users.user_id) AS id
    FROM user_event_attendance AS attendance
    INNER JOIN users ON users.user_id = attendance.user_id
    WHERE attendance.event_id = ? AND attendance.RSVP = TRUE;
`;
    connection.query(yesQuery, [req.params.eventID], function (err, yesRows) {
      connection.release(); // release connection
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      const yesResponses = structuredClone(yesRows);

      // Get the nos
      var no_responses;
      req.pool.getConnection(function (err, connection) {
        if (err) {
          console.log(err);
          res.sendStatus(500);
          return;
        }
        const noQuery = `
        SELECT CONCAT(users.first_name, ' ', users.last_name) AS name, BIN_TO_UUID(users.user_id) AS id
        FROM user_event_attendance AS attendance
        INNER JOIN users ON users.user_id = attendance.user_id
        WHERE attendance.event_id = ? AND attendance.RSVP = FALSE;
    `;
        connection.query(noQuery, [req.params.eventID], function (err, noRows) {
          connection.release(); // release connection
          if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
          }
          const noResponses = structuredClone(noRows);

          const resp_body = {
            yes: yesResponses,
            no: noResponses
          };
          res.type('json');
          res.send(JSON.stringify(resp_body));
          return;
        });
      });
      return;
    });
  });
});

router.post('/event/create', function(req, res, next){
  // Get the event content from the request body
  let title = req.body.title;
  let description = req.body.description;
  let details = req.body.details;
  let date = req.body.date;
  let start_time = req.body.startTime;
  let end_time = req.body.endTime;
  let location = req.body.location;
  let image_url = req.body.image_url;
  let public = req.body.public;

  // Validate each field of the event

  // Convert date and start and end time to start and end datetimes
  let start_date_time = date + ' ' + start_time;
  let end_date_time = date + ' ' + end_time;

  // Need to get which branch they manage from the DB
  let branch_id = 1;  // This should definitely not be hardcoded to 1

  // Add to DB
  // Construct the SQL query
  let query = "INSERT INTO events (branch_id, event_name, event_description, event_details, start_date_time, end_date_time, event_location, event_image, is_public) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";

  // Query the SQL database
  req.pool.getConnection( function(err,connection) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    connection.query(query, [branch_id, title, description, details, start_date_time, end_date_time, location, image_url, public], function(err, rows, fields) {
      connection.release(); // release connection
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      // Added successfully
      res.sendStatus(200);
      return;
    });
  });
});

router.post('/event/edit/:eventID', function(req,res,next){
  // Check the event exists?
  /*
    DO THIS!!!!!!!!!!!!
  */

  // Check the manager has authority to edit event, i.e. right branch
  /*
    DO THIS!!!!!!!!!!!!
  */


  // Check which fields were present in the request
  if(req.body.title !== undefined){
    // Construct the SQL query to update the title
    let query = "UPDATE events SET event_name=? WHERE event_id=?";

    // Query the SQL database
    req.pool.getConnection( function(err,connection) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      connection.query(query, [req.body.title, req.params.eventID], function(err, rows, fields) {
        connection.release(); // release connection
        if (err) {
          console.log(err);
          res.sendStatus(500);
          return;
        }
        // Added successfully, move on to next one
      });
    });
  }

  if(req.body.description !== undefined){
    // Construct the SQL query to update the title
    let query = "UPDATE events SET event_description=? WHERE event_id=?";

    // Query the SQL database
    req.pool.getConnection( function(err,connection) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      connection.query(query, [req.body.description, req.params.eventID], function(err, rows, fields) {
        connection.release(); // release connection
        if (err) {
          console.log(err);
          res.sendStatus(500);
          return;
        }
        // Added successfully, move on to next one
        return;
      });
    });
  }

  if(req.body.details !== undefined){
    // Construct the SQL query to update the title
    let query = "UPDATE events SET event_details=? WHERE event_id=?";

    // Query the SQL database
    req.pool.getConnection( function(err,connection) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      connection.query(query, [req.body.details, req.params.eventID], function(err, rows, fields) {
        connection.release(); // release connection
        if (err) {
          console.log(err);
          res.sendStatus(500);
          return;
        }
        // Added successfully, move on to next one
        return;
      });
    });
  }

  if(req.body.date !== undefined){

    // Query the SQL database
    req.pool.getConnection( function(err,connection) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      // Get the start and end times for the event
      let query = "SELECT TIME(start_datetime) AS start_time, TIME(end_datetime) AS end_time FROM events WHERE event_id=?";
      connection.query(query, [req.body.title, req.params.eventID], function(err, rows, fields) {
        connection.release(); // release connection
        if (err) {
          console.log(err);
          res.sendStatus(500);
          return;
        }
        // construct the new start and end datetimes
        let start_date_time = req.body.date + ' ' + rows[0].start_time;
        let end_date_time = req.body.date + ' ' + rows[0].end_time;

        // Update the times in the DB
        query = "UPDATE events SET start_date_time=?, end_date_time=? WHERE event_id=?";
        connection.query(query, [start_date_time, end_date_time, req.params.eventID], function(err, rows, fields) {
          connection.release(); // release connection
          if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
          }
          // All done, move on to next thing
          return;
        });

        return;
      });
    });
  }

  res.sendStatus(200);
});

module.exports = router;