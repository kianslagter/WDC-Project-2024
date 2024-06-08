var express = require('express');
var router = express.Router();
const formidable = require('formidable');
var fs = require('fs');
var tools = require('./helpers');
const path = require('path');

router.get('/events/create', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'create_event.html'));
});

router.get('/events/edit/:eventId', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'edit_event.html'));
});

router.get('/events/responses/:eventId', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'event_responses.html'));
});

router.get('/news/create', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'create_news.html'));
});

router.get('/branches/id/:branchId', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'manager_dashboard.html'));
});

router.get('/branches/id/:branchId/view_members', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'view_members.html'));
});

router.post('/image/upload', function(req, res, next){
  /*
    Expected format:
      {
        file: file
        public: true or false
        branch: id of branch it belongs to
      }

    Returns:
      {
        image_id: the id of the file e.g. 34
        image_path: path to make get request to get image e.g. /image/34
      }
  */

  // Code modified from https://www.geeksforgeeks.org/how-to-upload-file-using-formidable-module-in-node-js/
  const form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    // Check for error in parsing form
    if(err){
      tools.sendError(res, err);
      return;
    }
    // Check validity of inputs
    // Check for the file
    if(files.file === undefined){
      res.status(400).send("File undefined");
      return;
    }
    // Check file type here
    if(!files.file[0].mimetype.includes("image")){
      // maybe this should be made more specific?
      res.status(400).send("Incorrect file type");
      return;
    }
    // Check the public field
    if(fields.public === undefined){
      // Doesn't exist, so public = false
      fields.public = false;
    }
    // Change public from on off to true false
    if(fields.public == 'on'){
      fields.public = true;
    } else {
      fields.public = false;
    }

    // Check supplied branch
    if(fields.branch === undefined || !Number.isInteger(parseInt(fields.branch))){
      res.status(400).send("bad branch");
      return;
    }

    // Add the entry to the database
    let query = `INSERT INTO images
      (filetype, file_name_orig, branch_id, public)
      VALUES (?,?,?,?);`;
    tools.sqlHelper(query, [files.file[0].mimetype, files.file[0].originalFilename, fields.branch, fields.public], req).then(function (results){
      // Wait for insertion in table
      // get the id of the inserted image
      query = `SELECT LAST_INSERT_ID() AS image_id;`;
      tools.sqlHelper(query, [], req).then(function(results) {
        // Now have the id, so get the filename
        let image_id = results[0].image_id;
        query = `SELECT CONCAT(BIN_TO_UUID(file_name_rand), file_name_orig) AS file_name FROM images WHERE image_id = ?;`;
        tools.sqlHelper(query, [image_id], req).then(function(results){
          // Get old and new path to image
          let oldPath = files.file[0].filepath;
          let newPath = 'images/' + results[0].file_name;
          // Read image data
          let rawData = fs.readFileSync(oldPath);
          // Write the file
          fs.writeFile(newPath, rawData, function (err) {
            if (err){
              tools.sendError(res, err);
              return;
            }
            let return_struct = {
              'image_id' : image_id,
              'image_path': '/image/' + image_id
            };
            res.status(200).json(return_struct);
            return;
          });
        }).catch(function(err) {return tools.sendError(res,err);});
      }).catch(function(err) {return tools.sendError(res,err);});
    }).catch(function(err) {return tools.sendError(res,err);});
  });
  return;
});

router.post('/event/responses/:eventID', function (req, res, next) {
  // Check manager is manager of the branch the event is owned by
  var query = "SELECT branch_id AS branch FROM events WHERE event_id = ?;";
  tools.sqlHelper(query, [req.params.eventID], req).then(function(results){
    if(results.length == 0){
      // Event doesn't exist
      res.status(404).send("Event with provided ID not found");
      return;
    } else if(results[0].branch != req.session.branch_managed){
      // Not a manager of correcty branch
      res.status(403).send("Not a manager of correct branch to view responses for this event");
      return;
    }
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
  }).catch(function(err) {tools.sendError();});
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
  if(title === undefined || typeof(title) != "string"){
    res.status(400).send("Title undefined or not string");
    return;
  }
  if(description === undefined || typeof(description) != "string"){
    res.status(400).send("Description undefined or not string");
    return;
  }
  if(details === undefined || typeof(details) != "string"){
    res.status(400).send("Details undefined or not string");
    return;
  }
  if(date === undefined || typeof(date) != "string"){
    res.status(400).send("date undefined or not string");
    return;
  }
  if(start_time === undefined || typeof(start_time) != "string"){
    res.status(400).send("start time undefined or not string");
    return;
  }
  if(end_time === undefined || typeof(end_time) != "string"){
    res.status(400).send("end time undefined or not string");
    return;
  }
  if(location === undefined || typeof(location) != "string"){
    res.status(400).send("Location undefined or not string");
    return;
  }
  if(image_url === undefined || typeof(image_url) != "string"){
    res.status(400).send("image_url undefined or not string");
    return;
  }
  if(public === undefined || typeof(public) != "string"){
    res.status(400).send("Public undefined or not string");
    return;
  }

  // Convert date and start and end time to start and end datetimes
  let start_date_time = date + ' ' + start_time;
  let end_date_time = date + ' ' + end_time;

  // Need to get which branch they manage from the DB
  let branch_id = req.session.branch_managed;
  if(branch_id === null){
    res.status(403).send("Must be manager of branch to create event");
    return;
  }
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
  const eventID = req.params.eventID;

  // Check the event exists, and it is the correct branch (the manager's branch)
  var query = `SELECT branch_id AS branch FROM events WHERE event_id = ?;`;
  tools.sqlHelper(query, [eventID], req).then(function (results) {
    if(results.length == 0){
      // Event not found
      res.status(400).send("Event not found");
      return;
    } else if (results[0].branch !== req.session.branch_managed){
      // Wrong branch
      res.status(403).send("Can only edit events of branches you manage");
    }

    // Check which fields were present in the request
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
      res.status(400).send("Nothing to update"); // Bad Request
      return;
    }

    query = `UPDATE events SET ${fieldsToUpdate.join(", ")} WHERE event_id=?`;
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
  }).catch(function (err) {tools.sendError(err);});
});

router.post('/event/delete/:eventID', function (req, res, next) {
  const eventID = req.params.eventID;

  // Check the event exists, and it is the correct branch (the manager's branch)
  var query = `SELECT branch_id AS branch FROM events WHERE event_id = ?;`;
  tools.sqlHelper(query, [eventID], req).then(function (results) {
    if(results.length == 0){
      // Event not found
      res.status(400).send("Event not found");
      return;
    } else if (results[0].branch !== req.session.branch_managed){
      // Wrong branch
      res.status(403).send("Can only delete events of branches you manage");
    }

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
  }).catch(function (err) {tools.sendError(err);});
});

router.get('/branch_information', function(req, res, next) {
  var branchID = req.query.id;

  // Need to add branch id validation

  var statistics = {
    "branch_name": null,
    "num_branch_members": 0,
    "num_upcoming_events": 0,
    "num_total_events": 0,
    "upcoming_events": null,
    "other_branch_managers": null
  };

  req.pool.getConnection(function(err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }

    // Query 1
    var query = `SELECT
      (SELECT branch_name FROM branches WHERE branch_id = ?) AS branch_name,
      (SELECT COUNT(*) FROM user_branch_affiliation WHERE branch_id = ?) AS num_branch_members,
      (SELECT COUNT(*) FROM events WHERE branch_id = ? AND start_date_time > NOW()) AS num_upcoming_events,
      (SELECT COUNT(*) FROM events WHERE branch_id = ?) AS num_total_events;
    `;

    var prepared_array = [];

    for (let i = 0; i < query.length; i++) {
      if (query[i] === '?') {
        prepared_array.push(branchID);
      }
    }

    connection.query(query, prepared_array, function(err, rows, fields) {
      // connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }

      statistics.branch_name = rows[0]['branch_name'];

      statistics.num_branch_members = rows[0]['num_branch_members'];
      statistics.num_upcoming_events = rows[0]['num_upcoming_events'];
      statistics.num_total_events = rows[0]['num_total_events'];
    });


    // Query 2
    query = `SELECT event_id, event_name, start_date_time FROM events WHERE branch_id = ? AND start_date_time > NOW() ORDER BY start_date_time ASC LIMIT 5;`;

    connection.query(query, [branchID], function(err, rows, fields) {
      if (err) {
        res.sendStatus(500);
        return;
      }

      statistics.upcoming_events = rows;

      for (let i = 0; i < statistics.upcoming_events.length; i++) {
        var dateTime = statistics.upcoming_events[i].start_date_time.toString();
        var dT_array = dateTime.split(' ');

        statistics.upcoming_events[i].start_date_time = `${dT_array[2]} ${dT_array[1]} ${dT_array[3]}`;
      }
    });


    // Query 3
    query = `SELECT first_name, last_name, phone_num, email FROM users WHERE branch_managed = ?;`;

    connection.query(query, [branchID], function(err, rows, fields) {
      connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }

      statistics.other_branch_managers = rows;

      console.log(statistics);

      res.status(200).send(statistics);
    });
  });
});

router.get('/get_members', function(req, res, next) {
  var branchID = req.query.id;

  // Need to add branch id validation

  var response = {
    "branch_name": null,
    "members": null
  };

  req.pool.getConnection(function(err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }

      // Query 1
      var query = `SELECT branch_name FROM branches WHERE branch_id = ?;`;

      connection.query(query, [branchID], function(err, rows, fields) {
        // connection.release();
        if (err) {
          res.sendStatus(500);
          return;
        }

        response.branch_name = rows[0]['branch_name'];
      });

    // Query 2
    // Should systems admins be shown?
    query = `SELECT users.username, first_name, last_name, email, phone_num, postcode, branch_managed FROM users INNER JOIN user_branch_affiliation ON user_branch_affiliation.user_id = users.user_id WHERE branch_id = ? AND users.system_admin = FALSE;`;

    connection.query(query, [branchID], function(err, rows, fields) {
      connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }

      response.members = rows;

      console.log(response.members);

      res.status(200).send(response);
    });
  });
});

router.post('/user/remove/:userID', function (req, res, next) {
  const userID = req.params.userID;
  console.log(userID);

  // FOR TESTS - IMPORTANT NEED TO REMOVE THIS BEFORE SUBMISSION ---------------------
  req.session.branch_managed = 1;

  // Check the member exists, and it is the correct branch (the manager's branch)
  var query = `SELECT branch_id AS branch FROM user_branch_affiliation INNER JOIN users ON users.user_id = user_branch_affiliation.user_id WHERE username = ? AND users.system_admin = FALSE AND branch_managed IS NULL;`;

  tools.sqlHelper(query, [userID], req).then(function (results) {
    console.log(results);
    if (results.length == 0){
      // Member not found
      res.status(400).send("Member not found");
      return;
    } else if (results[0].branch !== req.session.branch_managed){
      // Wrong branch
      res.status(403).send("Can only remove non-manager members of branches you manage");
      return;
    }

    let query = "DELETE FROM user_branch_affiliation WHERE user_id IN (SELECT user_id FROM users WHERE username = ?);";

    req.pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      connection.query(query, [userID], function (err, rows, fields) {
        connection.release(); // release connection
        if (err) {
          console.log(err);
          res.sendStatus(500);
          return;
        }
        res.sendStatus(200);
        return;
      });
    });
  }).catch(function (err) {tools.sendError(err);});
});

module.exports = router;