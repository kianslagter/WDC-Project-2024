var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.post('/events/rsvp', function(req, res, next){
  // Get the JSON object from the response
  if(req.body.eventID === undefined || typeof(req.body.eventID) !== "string"){
    // Invalid argument event id
    res.status(400);  // bad request
    res.send();
  }
  if(req.body.RSVP === undefined || typeof(req.body.RSVP) !== "string" || (req.body.RSVP != 'yes' && req.body.RSVP != 'no')){
    // Invalid argument RSVP
    res.status(400);  // bad request
    res.send();
  }

  // Check user belongs to the correct branch???

  // Update the database
  let username = req.session.username;  // Username of user
  let event_id = req.body.eventID;      // Event ID of the event theyre RSVPing to
  let response = false;                 // Their response to the event
  if(req.body.RSVP == 'yes'){
    response = true;
  }

  req.pool.getConnection( function(err,connection) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    var query = "INSERT INTO user_event_attendance (event_id, username, rsvp) VALUES (?,?,?) ON DUPLICATE KEY UPDATE rsvp=?;";
    connection.query(query, [event_id, username, response, response], function(err, rows, fields) {
      connection.release(); // release connection
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      console.log(rows);
      res.sendStatus(200);
      return;
    });
  });
});



module.exports = router;
