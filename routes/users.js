var express = require('express');
var router = express.Router();
var fs = require('fs');

function sendError(res, err){
  // Send
  res.status(500).send(err.message);
  return;
}

router.post('/image/upload', function(req, res, next){
  /*
    Expected format:
      {
        image: DATAURL encoded image
        filetype: 'png' or 'jpg' etc
        public: '0' or '1'
        branch: id of branch it belongs to
      }

    Returns:
      {
        image_id: the id of the file e.g. 34
        image_path: path to make get request to get image e.g. /image/34
      }
  */

  // Check validity of requests parameters
  if(req.body.image === undefined){
    res.status(400).send("Image undefined");
    return;
  }
  // This should really be validated somehow probably

  if(req.body.filetype === undefined || typeof(req.body.filetype) != "string"){
    res.status(400).send("Bad filetype");
    return;
    // should also check it is an accepted filetype here too
  }

  if(req.body.public === undefined || (req.body.public != '0' && req.body.public != '1')){
    res.status(400).send("Invalid public parameter. '0' or '1'");
    return;
  }

  if(req.body.branch === undefined || !Number.isInteger(req.body.branch)){
    res.status(400).send("bad branch");
    return;
  }

  // Add the entry to the database
  let query = `INSERT INTO images
    (filetype, branch_id, public)
    VALUES (?,?,?);`;
  req.sqlHelper(query, [req.body.filetype, req.body.branch, req.body.public], req).then(function (results)
{
  // Wait for insertion in table
  // get the id of the inserted image
  query = `SELECT LAST_INSERT_ID() AS image_id;`;
  req.sqlHelper(query, [], req).then(function(results) {
    // Now have the idea, so get the filename
    let image_id = results[0].image_id;
    query = `SELECT BIN_TO_UUID(file_name) AS file_name FROM images WHERE image_id = ?;`;
    req.sqlHelper(query, [image_id], req).then(function(results){
      // Now have file name, so create the file
      fs.open('./images/' + results[0].file_name, 'w', function(err) { if (err) throw err;});
      fs.writeFile('./images/' + results[0].file_name, req.body.image, function (err) {
        if (err) throw err;
        // Done now, so can return the file id and path
        let return_struct = {
          'image_id' : image_id,
          'image_path': '/image/' + image_id
        };
        res.status(200).json(return_struct);
        return;
      });

    }).catch(function(err) {return sendError(res,err);});
  }).catch(function(err) {return sendError(res,err);});
}).catch(function(err) {return sendError(res, err);});
});

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
  let query = `SELECT EXISTS(SELECT * FROM events WHERE event_id = ?) AS event_exists;`;
  req.sqlHelper(query, [req.body.eventID], req).then( function(results){
    // Check if it exists
    if(results[0].event_exists == 0){
      // Event doesn't exist
      res.status(404).send("Event not found");
      return;
    }
    // Event does exist

    // Check the user is a member of the correct branch
    query = `SELECT EXISTS(
            SELECT * FROM user_branch_affiliation
            WHERE user_id=UUID_TO_BIN(?) AND branch_id=(
                  SELECT branch_id FROM events WHERE event_id = ?
                )
            ) AS member_of_branch;`;
    /*
            NOTE: COULD SIMPLIFY THE ABOVE QUERY POTENTIALLY BY STORING THE BRANCHES
            THAT THE MEMBER BELONGS TO IN SESSION VARIABLE AND COMPARING THE BRANCH
            ID OF THE EVENT TO THE ELEMENTS IN THIS VARIABLE
    */
    req.sqlHelper(query,[req.session.userID, req.body.eventID], req).then(function(results)
    {
      if(results[0].member_of_branch == 0){
        // Not a member of the branch
        res.status(403).send("Must be member of the branch to RSVP");
        return;
      }
      // They are a member of the branch, so add (or update) their RSVP in the database
      let response = false;                 // Their response to the event
      if (req.body.RSVP.toLowerCase() == 'yes') {
        response = true;
      }

      query = "INSERT INTO user_event_attendance (event_id, user_id, rsvp) VALUES (?,UUID_TO_BIN(?),?) ON DUPLICATE KEY UPDATE rsvp=?;";
      req.sqlHelper(query,[req.body.eventID, req.session.userID, response, response], req).then(function(results)
        {
          // Inserted succesfully, so return 200 ok
          res.status(200).send("RSVP recieved successfully");
        }
      ).catch(function(err) { return sendError(res, err);});
    }).catch(function(err) { return sendError(res, err);});
  }).catch(function(err) {return sendError(res, err);});
  return;
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
