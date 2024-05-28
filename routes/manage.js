var express = require('express');
var router = express.Router();

router.post('/event/responses/:eventID', function(req, res, next){
    // Should check manager is manager of the branch the event is owned by

    // Get the yeses
    var yes_responses;
    req.pool.getConnection( function(err,connection) {
        if (err) {
          console.log(err);
          res.sendStatus(500);
          return;
        }
        var query = "SELECT CONCAT(users.first_name, ' ' ,users.last_name) as name, users.username as id FROM user_event_attendance AS attendance INNER JOIN users on users.username = attendance.username WHERE attendance.event_id=? AND attendance.RSVP=TRUE;";
        connection.query(query, [req.params.eventID], function(err, rows, fields) {
          connection.release(); // release connection
          if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
          }
          yes_responses = structuredClone(rows);
           // Get the nos
            var no_responses;
            req.pool.getConnection( function(err,connection) {
                if (err) {
                console.log(err);
                res.sendStatus(500);
                return;
                }
                var query = "SELECT CONCAT(users.first_name, ' ' ,users.last_name) as name, users.username as id FROM user_event_attendance AS attendance INNER JOIN users on users.username = attendance.username WHERE attendance.event_id=? AND attendance.RSVP=FALSE;";
                connection.query(query, [req.params.eventID], function(err, rows, fields) {
                connection.release(); // release connection
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                    return;
                }
                no_responses = structuredClone(rows);

                let resp_body = {"yes": yes_responses, "no": no_responses};
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