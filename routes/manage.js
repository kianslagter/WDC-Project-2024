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

router.post('/event/create', function (req, res, next) {
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
  /*
          REALLY NEED TO DO THIS
  */

  // Convert date and start and end time to start and end datetimes
  let start_date_time = date + ' ' + start_time;
  let end_date_time = date + ' ' + end_time;

  // Need to get which branch they manage from the DB
  let branch_id = 1;  // This should definitely not be hardcoded to 1

  // Add to DB
  // Construct the SQL query
  let query = "INSERT INTO events (branch_id, event_name, event_description, event_details, start_date_time, end_date_time, event_location, event_image, is_public) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";

  // Query the SQL database
  req.pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.status(500).json({ message: "Database connection error" });
      return;
    }
    connection.query(query, [branch_id, title, description, details, start_date_time, end_date_time, location, image_url, public], function (err, rows, fields) {
      connection.release(); // release connection
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Database query error" });
        return;
      }
      // Added successfully
      res.status(200).json({ id: rows.insertId });
      return;
    });
  });
});

router.post('/event/edit/:eventID', function (req, res, next) {
  // Check the event exists?
  /*
    DO THIS!!!!!!!!!!!!
  */

  // Check the manager has authority to edit event, i.e. right branch
  /*
    DO THIS!!!!!!!!!!!!
  */

  // Check which fields were present in the request
  const eventID = req.params.eventID;
  const fieldsToUpdate = [];
  const values = [];

  // update title
  if (req.body.title !== undefined) {
    fieldsToUpdate.push("event_name=?");
    values.push(req.body.title);
  }
  // update description
  if (req.body.description !== undefined) {
    fieldsToUpdate.push("event_description=?");
    values.push(req.body.description);
  }
  // update details
  if (typeof req.body.details === 'string' && req.body.details.trim() !== '') {
    fieldsToUpdate.push("event_details=?");
    values.push(req.body.details);
  }

  // update date
  if (req.body.date !== undefined) {
    const startTime = req.body.startTime || "00:00:00";
    const endTime = req.body.endTime || "23:59:59";
    fieldsToUpdate.push("start_date_time=?");
    fieldsToUpdate.push("end_date_time=?");
    values.push(`${req.body.date} ${startTime}`, `${req.body.date} ${endTime}`);
  }

  // if no fields then return early
  if (fieldsToUpdate.length === 0) {
    res.sendStatus(400); // Bad Request
    return;
  }

  const query = `UPDATE events SET ${fieldsToUpdate.join(", ")} WHERE event_id=?`;
  values.push(eventID);

  // Query the SQL database
  req.pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    connection.query(query, values, function (err, results) {
      connection.release(); // release connection
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }

      res.sendStatus(200);
    });
  });
});

router.post('/event/delete/:eventID', function (req, res, next) {
  // Check they manage the right branch
  /*
      DO THIS
  */
  let query = "DELETE FROM events WHERE event_id=?;";
  req.pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    connection.query(query, [req.params.eventID], function (err, rows, fields) {
      connection.release(); // release connection
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.sendStatus(200);
    });
  });
});

module.exports = router;