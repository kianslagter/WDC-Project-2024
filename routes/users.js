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

  // Update the database
  // need the username to do this
  let username = "admin";
  

});

module.exports = router;
