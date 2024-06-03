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



module.exports = router;