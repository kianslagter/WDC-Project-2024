var express = require('express');
const path = require('path');
const { send } = require('process');
var fs = require('fs');
var tools = require('./helpers');

var router = express.Router();

router.use(checkPermission);

function checkPermission(req, res, next) {
  if (!req.session.admin) {
    res.status(403).send("You do not have permission to view admin pages.");
    return;
  }

  next();
}

router.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin_dashboard.html'));
});

router.get('/view_users', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'view_users.html'));
});

router.get('/branches/create', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'create_branch.html'));
});

router.get('/site_information', function (req, res, next) {
  if (!req.session.admin) {
    res.status(403).send("You do not have permission to get the details of this site.");
    return;
  }

  var statistics = {
    "num_site_users": 0,
    "num_upcoming_events": 0,
    "num_total_events": 0,
    "num_total_news": 0,
    "num_today_news": 0,
    "num_managers": 0,
    "other_admins": null
  };

  req.pool.getConnection(function (err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }

    // Query 1
    var query = `SELECT
      (SELECT COUNT(*) FROM user_branch_affiliation) AS num_site_users,
      (SELECT COUNT(*) FROM events WHERE start_date_time > NOW()) AS num_upcoming_events,
      (SELECT COUNT(*) FROM events) AS num_total_events,
      (SELECT COUNT(*) FROM news WHERE DATE(date_published) = CURRENT_DATE) AS num_today_news,
      (SELECT COUNT(*) FROM news) AS num_total_news,
      (SELECT COUNT(*) FROM users WHERE branch_managed IS NOT NULL) AS num_managers;
    `;

    connection.query(query, function (err, rows, fields) {
      // connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }

      statistics.num_site_users = rows[0]['num_site_users'];
      statistics.num_upcoming_events = rows[0]['num_upcoming_events'];
      statistics.num_total_events = rows[0]['num_total_events'];
      statistics.num_managers = rows[0]['num_managers'];
      statistics.num_total_news = rows[0]['num_total_news'];
      statistics.num_managers = rows[0]['num_managers'];
    });


    // Query 2
    query = `SELECT first_name, last_name, email, phone_num FROM users WHERE system_admin = TRUE;`;

    connection.query(query, function (err, rows, fields) {
      connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }

      statistics.other_admins = rows;

      res.status(200).send(statistics);
    });
  });
});

router.get('/get_users', function (req, res, next) {
  // Admin validation
  if (!req.session.admin) {
    res.status(403).send("Only system admins can get users.");
    return;
  }

  var response = {
    "users": null,
    "branches" : null
  };

  req.pool.getConnection(function (err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }

    // Query 1
    var query = `SELECT BIN_TO_UUID(user_id) AS user_id, first_name, last_name, email, phone_num, postcode, branch_managed, system_admin FROM users;`;

    connection.query(query, function (err, rows, fields) {
      // connection.release();
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }

      response.users = rows;
    });


    // Query 2
    query = `SELECT branch_name FROM branches;`;

    connection.query(query, function (err, rows, fields) {
      connection.release();
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }

      response.branches = rows;

      res.status(200).send(response);
    });
  });
});

router.post('/user/delete/:userID', function (req, res, next) {
  const userID = req.params.userID;

  // Admin validation
  if (!req.session.admin) {
    res.status(403).send("Only system admins can delete users.");
    return;
  }

  // Check the member exists.
  var query = `SELECT user_id AS user FROM users WHERE user_id = UUID_TO_BIN(?) AND system_admin = FALSE;`;

  tools.sqlHelper(query, [userID], req).then(function (results) {
    // console.log(results);
    if (results.length == 0) {
      // Member not found
      res.status(400).send("Member not found");
      return;
    }

    req.pool.getConnection(function (err, connection) {
      if (err) {
        // console.log(err);
        res.sendStatus(500);
        return;
      }

      // Remove from branches
      let query = "DELETE FROM user_branch_affiliation WHERE user_id = UUID_TO_BIN(?);";

      connection.query(query, [userID], function (err, rows, fields) {
        // connection.release(); // release connection
        if (err) {
          // console.log(err);
          res.sendStatus(500);
          return;
        }
      });

      // Delete from user_event_attendance
      query = `DELETE FROM user_event_attendance WHERE user_id = UUID_TO_BIN(?);`;

      connection.query(query, [userID], function (err, rows, fields) {
        // connection.release(); // release connection
        if (err) {
          // console.log(err);
          res.sendStatus(500);
          return;
        }
      });

      // Remove from users
      query = "DELETE FROM users WHERE user_id = UUID_TO_BIN(?);";

      connection.query(query, [userID], function (err, rows, fields) {
        connection.release(); // release connection
        if (err) {
          // console.log(err);
          res.sendStatus(500);
          return;
        }

        res.sendStatus(200);
        return;
      });
    });
  }).catch(function (err) {tools.sendError(err);});
});

router.post('/promote/admin/:userID', function (req, res, next) {
  var userID = req.params.userID;

  // Admin validation
  if (!req.session.admin) {
    res.status(403).send("Only system admins can promote users.");
    return;
  }

  // Check the member exists and is not an admin.
  var query = `SELECT user_id FROM users WHERE user_id = UUID_TO_BIN(?) AND users.system_admin = FALSE;`;

  tools.sqlHelper(query, [userID], req).then(function (results) {
    if (results.length == 0) {
      // Member not found
      res.status(400).send("Member not found");
      return;
    }

    req.pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }

      query = `UPDATE users SET system_admin = TRUE WHERE user_id = UUID_TO_BIN(?);`;

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

router.post('/branch/:branchID/promote/manager/:userID', function (req, res, next) {
  const userID = req.params.userID;
  const branchID = req.params.branchID;
  // console.log(branchID);

  if (!req.session.admin) {
    res.status(403).send("You do not have permission to promote branch members.");
    return;
  }

  // Check the member exists.
  var query = `SELECT user_id AS user FROM users WHERE users.user_id = UUID_TO_BIN(?);`;

  tools.sqlHelper(query, [userID], req).then(function (results) {
    // console.log(results);
    if (results.length == 0){
      // Member not found
      res.status(400).send("Member not found");
      return;
    }

    let query = `UPDATE users SET branch_managed = (SELECT branch_id AS branch_num FROM branches WHERE branch_name = ?) WHERE user_id = UUID_TO_BIN(?);`;

    req.pool.getConnection(function (err, connection) {
      if (err) {
        // console.log(err);
        res.sendStatus(500);
        return;
      }
      connection.query(query, [branchID, userID], function (err, rows, fields) {
        // console.log(rows);
        connection.release(); // release connection
        if (err) {
          // console.log(err);
          res.sendStatus(500);
          return;
        }

        res.sendStatus(200);
        return;
      });
    });
  }).catch(function (err) {tools.sendError(res, err);});
});

router.post('/branch/create', function (req, res, next) {
  // Get the branch content from the request body
  let name = req.body.name;
  let email = req.body.email;
  let phone = req.body.phone;
  let streetNumber = req.body.streetNumber;
  let streetName = req.body.streetName;
  let city = req.body.city;
  let state = req.body.state;
  let postcode = req.body.postcode;
  let description = req.body.description;
  let image_url = req.body.image_url;

  // Validate each field of the branch
  if (!name || typeof (name) !== "string") {
    res.status(400).send("Branch name undefined or not string");
    return;
  }
  if (!email || typeof (email) !== "string") {
    res.status(400).send("Email undefined or not string");
    return;
  }
  if (phone && typeof (phone) !== "string") {
    res.status(400).send("Phone not string");
    return;
  }
  if (streetNumber && typeof (streetNumber) !== "string") {
    res.status(400).send("Street number not string");
    return;
  }
  if (streetName && typeof (streetName) !== "string") {
    res.status(400).send("Street name not string");
    return;
  }
  if (!city || typeof (city) !== "string") {
    res.status(400).send("City undefined or not string");
    return;
  }
  if (!state || typeof (state) !== "string") {
    res.status(400).send("State undefined or not string");
    return;
  }
  if (!postcode || typeof (postcode) !== "string") {
    res.status(400).send("Postcode undefined or not string");
    return;
  }
  if (!description || typeof (description) !== "string") {
    res.status(400).send("Description undefined or not string");
    return;
  }
  if (image_url && typeof (image_url) !== "string") {
    res.status(400).send("Image URL not string");
    return;
  }

  // Add to DB
  // Construct the SQL query
  let query = "INSERT INTO branches (branch_name, email, phone, street_number, street_name, city, branch_state, postcode, branch_description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";

  // Query the SQL database
  req.pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.status(500).json({ message: "Database connection error" });
      return;
    }
    connection.query(query, [name, email, phone, streetNumber, streetName, city, state, postcode, description, image_url], function (err, rows, fields) {
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

router.post('/branch/delete/:branchID', function (req, res, next) {
  const branchID = req.params.branchID;

  // Check if the branch exists and the user is authorized to delete it
  let query = `SELECT branch_id AS branch FROM branches WHERE branch_id = ?;`;
  tools.sqlHelper(query, [branchID], req).then(function (results) {
    if (results.length == 0) {
      // Branch not found
      res.status(400).send("Branch not found");
      return;
    } else if (!req.session.admin && results[0].branch !== req.session.branch_managed) {
      // Wrong branch
      res.status(403).send("Can only delete branches you manage");
      return;
    }

    query = "DELETE FROM branches WHERE branch_id=?;";
    req.pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      connection.query(query, [req.params.branchID], function (err, rows, fields) {
        connection.release(); // release connection
        if (err) {
          console.log(err);
          res.sendStatus(500);
          return;
        }
        res.sendStatus(200);
      });
    });
  }).catch(function (err) { tools.sendError(res, err); });
});

module.exports = router;