// branch details
function getBranchDetails(branchID, callback, errorCallback) {
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', '/branch/id/' + branchID + '/details.json', true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4) {
            if (xhttp.status == 200) {
                var data = JSON.parse(xhttp.responseText);
                callback(data);
            } else if (xhttp.status == 404) {
                console.error("Branch not found");
            } else {
                console.error("Error fetching branch details");
                if (errorCallback) {
                    errorCallback(xhttp.status);
                }
            }
        }
    };
    xhttp.send();
}