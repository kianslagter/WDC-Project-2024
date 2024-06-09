var express = require('express');
const path = require('path');
const { send } = require('process');
var fs = require('fs');
var tools = require('./helpers');

var router = express.Router();

router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin_dashboard.html'));
});

router.get('/view_users', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'view_users.html'));
});

router.get('/branches/create', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'create_branch.html'));
});

router.get('/site_information', function(req, res, next) {
  var statistics = {
    "num_site_users": 0,
    "num_upcoming_events": 0,
    "num_total_events": 0,
    "num_total_news": 0,
    "other_admins": null
  };

  req.pool.getConnection(function(err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }

    // Query 1
    var query = `SELECT
      (SELECT COUNT(*) FROM user_branch_affiliation) AS num_site_users,
      (SELECT COUNT(*) FROM events WHERE start_date_time > NOW()) AS num_upcoming_events,
      (SELECT COUNT(*) FROM events) AS num_total_events,
      (SELECT COUNT(*) FROM news) AS num_total_news;
    `;

    connection.query(query, function(err, rows, fields) {
      // connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }

      statistics.num_site_users = rows[0]['num_site_users'];
      statistics.num_upcoming_events = rows[0]['num_upcoming_events'];
      statistics.num_total_events = rows[0]['num_total_events'];
      statistics.num_total_news = rows[0]['num_total_news'];
    });


    // Query 2
    query = `SELECT first_name, last_name, email, phone_num FROM users WHERE system_admin = TRUE;`;

    connection.query(query, function(err, rows, fields) {
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

module.exports = router;