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
    SELECT CONCAT(users.first_name, ' ', users.last_name) AS name, users.username AS id
    FROM user_event_attendance AS attendance
    INNER JOIN users ON users.username = attendance.user_id
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
        SELECT CONCAT(users.first_name, ' ', users.last_name) AS name, users.username AS id
        FROM user_event_attendance AS attendance
        INNER JOIN users ON users.username = attendance.user_id
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

module.exports = router;