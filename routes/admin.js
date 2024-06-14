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
      statistics.num_today_news = rows[0]['num_today_news'];
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
    "users": null
  };

  req.pool.getConnection(function (err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }

    // Query 1
    var query = `SELECT BIN_TO_UUID(user_id) AS user_id, first_name, last_name, email, phone_num, postcode, branch_managed, system_admin FROM users;`;

    connection.query(query, function (err, rows, fields) {
      connection.release();
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }

      response.users = rows;

      // console.log(response.members);

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

router.post('/user/promote/:userID', function (req, res, next) {
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

module.exports = router;