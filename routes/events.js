var express = require('express');
var router = express.Router();


// EVENT DETAILS
function getEventDetails(eventID) {
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', '/events/id/' + eventID + '/details.json', true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var data = JSON.parse(xhttp.responseText);
            console.log(data);
            return data;
        }
    }
    xhttp.send();
}





module.exports = router;