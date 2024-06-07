// news details
function getNewsDetails(articleID, callback, errorCallback) {
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', '/news/id/' + articleID + '/details.json', true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.onreadystatechange = function () {
      if (xhttp.readyState == 4) {
        if (xhttp.status == 200) {
          var data = JSON.parse(xhttp.responseText);
          callback(data);
        } else if (xhttp.status == 404) {
          console.error("Article not found");
        } else {
          console.error("Error fetching article");
        }
      }
    };
    xhttp.send();
  }
